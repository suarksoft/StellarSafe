import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { promisify } from 'util';
import { exec } from 'child_process';
import simpleGit from 'simple-git';
import { glob } from 'glob';
import { ContractInfo, GitInfo, BuildInfo } from './types';

const execAsync = promisify(exec);

export class ContractCollector {
  private projectRoot: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  /**
   * Collect all contract information
   */
  async collect(): Promise<ContractInfo> {
    console.log('📦 Collecting contract information...\n');

    const contractName = await this.getContractName();
    const wasmInfo = await this.getWasmInfo();
    const sourceInfo = await this.getSourceInfo();
    const gitInfo = await this.getGitInfo();
    const buildInfo = await this.getBuildInfo();

    return {
      contractName,
      wasmHash: wasmInfo.hash,
      wasmSize: wasmInfo.size,
      sourceHash: sourceInfo.hash,
      sourceFiles: sourceInfo.files,
      gitCommit: gitInfo.commit,
      gitRemote: gitInfo.remote,
      gitBranch: gitInfo.branch,
      rustVersion: buildInfo.rustVersion,
      sorobanVersion: buildInfo.sorobanVersion,
      timestamp: Date.now(),
    };
  }

  /**
   * Get contract name from Cargo.toml
   */
  private async getContractName(): Promise<string> {
    try {
      const cargoTomlPath = path.join(this.projectRoot, 'Cargo.toml');
      
      if (!fs.existsSync(cargoTomlPath)) {
        throw new Error('Cargo.toml not found. Make sure you are in a Rust/Soroban project directory.');
      }

      const cargoToml = fs.readFileSync(cargoTomlPath, 'utf-8');
      const nameMatch = cargoToml.match(/^name\s*=\s*"(.+)"$/m);
      
      if (!nameMatch) {
        throw new Error('Could not find package name in Cargo.toml');
      }

      return nameMatch[1];
    } catch (error) {
      throw new Error(`Failed to read contract name: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get WASM binary information
   */
  private async getWasmInfo(): Promise<{ hash: string; size: number }> {
    try {
      // Look for WASM file in common locations
      const possiblePaths = [
        'target/wasm32-unknown-unknown/release/*.wasm',
        'target/wasm32v1-none/release/*.wasm',
        'target/wasm32-unknown-unknown/release-with-logs/*.wasm',
      ];

      let wasmPath: string | null = null;

      for (const pattern of possiblePaths) {
        const fullPattern = path.join(this.projectRoot, pattern);
        const files = await glob(fullPattern, { nodir: true });
        
        if (files.length > 0) {
          // Get the most recently modified file
          wasmPath = files.sort((a: string, b: string) => {
            return fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime();
          })[0];
          break;
        }
      }

      if (!wasmPath) {
        throw new Error(
          'WASM binary not found. Please build your contract first:\n' +
          '  cargo build --target wasm32-unknown-unknown --release\n' +
          'or:\n' +
          '  soroban contract build'
        );
      }

      const wasmBuffer = fs.readFileSync(wasmPath);
      const hash = crypto.createHash('sha256').update(wasmBuffer).digest('hex');
      const size = wasmBuffer.length;

      console.log(`✓ WASM binary found: ${path.basename(wasmPath)}`);
      console.log(`  Hash: ${hash.substring(0, 16)}...`);
      console.log(`  Size: ${(size / 1024).toFixed(2)} KB\n`);

      return { hash, size };
    } catch (error) {
      throw new Error(`Failed to read WASM binary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get source code information
   */
  private async getSourceInfo(): Promise<{ hash: string; files: string[] }> {
    try {
      // Find all Rust source files
      const pattern = path.join(this.projectRoot, 'src/**/*.rs');
      const sourceFiles = await glob(pattern, { nodir: true });

      if (sourceFiles.length === 0) {
        throw new Error('No Rust source files found in src/ directory');
      }

      // Create hash of all source files combined
      const hash = crypto.createHash('sha256');
      const relativeFiles: string[] = [];

      for (const file of sourceFiles.sort()) {
        const content = fs.readFileSync(file);
        hash.update(content);
        
        // Store relative path
        const relativePath = path.relative(this.projectRoot, file);
        relativeFiles.push(relativePath);
      }

      const sourceHash = hash.digest('hex');

      console.log(`✓ Found ${sourceFiles.length} source files`);
      console.log(`  Source hash: ${sourceHash.substring(0, 16)}...\n`);

      return {
        hash: sourceHash,
        files: relativeFiles,
      };
    } catch (error) {
      throw new Error(`Failed to analyze source code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get Git repository information
   */
  private async getGitInfo(): Promise<GitInfo> {
    try {
      const git = simpleGit(this.projectRoot);
      
      // Check if we're in a git repository
      const isRepo = await git.checkIsRepo();
      
      if (!isRepo) {
        console.log('⚠ Not a git repository - skipping git information\n');
        return {};
      }

      const commit = await git.revparse(['HEAD']).catch(() => undefined);
      const branch = await git.revparse(['--abbrev-ref', 'HEAD']).catch(() => undefined);
      
      // Get remote URL
      const remotes = await git.getRemotes(true);
      const origin = remotes.find((r: any) => r.name === 'origin');
      const remote = origin?.refs?.fetch || origin?.refs?.push;

      if (commit) {
        console.log(`✓ Git commit: ${commit.substring(0, 8)}`);
      }
      if (branch) {
        console.log(`  Branch: ${branch}`);
      }
      if (remote) {
        console.log(`  Remote: ${remote}`);
      }
      console.log();

      return {
        commit: commit?.trim(),
        remote: remote,
        branch: branch?.trim(),
      };
    } catch (error) {
      console.log('⚠ Could not retrieve git information\n');
      return {};
    }
  }

  /**
   * Get build environment information
   */
  private async getBuildInfo(): Promise<BuildInfo> {
    const buildInfo: BuildInfo = {};

    try {
      // Get Rust version
      const { stdout: rustVersion } = await execAsync('rustc --version');
      buildInfo.rustVersion = rustVersion.trim();
      console.log(`✓ Rust version: ${buildInfo.rustVersion}`);
    } catch {
      console.log('⚠ Could not detect Rust version');
    }

    try {
      // Get Soroban CLI version
      const { stdout: sorobanVersion } = await execAsync('soroban --version');
      buildInfo.sorobanVersion = sorobanVersion.trim();
      console.log(`  Soroban CLI: ${buildInfo.sorobanVersion}`);
    } catch {
      console.log('⚠ Could not detect Soroban CLI version');
    }

    console.log();

    return buildInfo;
  }
}

