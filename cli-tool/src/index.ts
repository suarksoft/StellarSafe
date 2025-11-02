#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { ContractCollector } from './collector';
import { ApiClient } from './api-client';
import { VerificationCheck } from './types';

const program = new Command();

program
  .name('stellarsafe')
  .description('CLI tool for verifying Soroban smart contracts on StellarSafe')
  .version('1.0.0');

program
  .command('verify')
  .description('Verify a contract using a verification code')
  .argument('<code>', '6-character verification code from StellarSafe')
  .option('-d, --directory <path>', 'Contract directory path', process.cwd())
  .option('-a, --api-url <url>', 'Custom API URL', 'https://stellar-safe-liard.vercel.app')
  .action(async (code: string, options: { directory: string; apiUrl: string }) => {
    try {
      console.log(chalk.bold.cyan('\n🔒 StellarSafe Contract Verification\n'));
      console.log(chalk.dim('═'.repeat(60)) + '\n');

      // Validate code format
      if (!code || code.length !== 6) {
        console.error(chalk.red('✗ Invalid verification code format'));
        console.log(chalk.yellow('  Expected: 6-character code (e.g., X7K9M2)\n'));
        process.exit(1);
      }

      const formattedCode = code.toUpperCase();
      console.log(chalk.gray(`Verification Code: ${chalk.white.bold(formattedCode)}`));
      console.log(chalk.gray(`Project Directory: ${chalk.white(options.directory)}`));
      console.log(chalk.gray(`API Endpoint: ${chalk.white(options.apiUrl)}\n`));

      // Step 1: Collect contract information
      const spinner = ora('Collecting contract information...').start();
      
      let contractInfo;
      try {
        const collector = new ContractCollector(options.directory);
        contractInfo = await collector.collect();
        spinner.succeed(chalk.green('Contract information collected'));
      } catch (error) {
        spinner.fail(chalk.red('Failed to collect contract information'));
        console.error(chalk.red(`\n✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`));
        process.exit(1);
      }

      // Display collected information
      console.log(chalk.dim('\n─'.repeat(60)));
      console.log(chalk.bold('\n📋 Collected Information:\n'));
      console.log(chalk.gray(`  Contract Name:  ${chalk.white(contractInfo.contractName)}`));
      console.log(chalk.gray(`  WASM Hash:      ${chalk.white(contractInfo.wasmHash.substring(0, 24))}...`));
      console.log(chalk.gray(`  WASM Size:      ${chalk.white((contractInfo.wasmSize / 1024).toFixed(2))} KB`));
      console.log(chalk.gray(`  Source Files:   ${chalk.white(contractInfo.sourceFiles.length)} files`));
      console.log(chalk.gray(`  Source Hash:    ${chalk.white(contractInfo.sourceHash.substring(0, 24))}...`));
      
      if (contractInfo.gitCommit) {
        console.log(chalk.gray(`  Git Commit:     ${chalk.white(contractInfo.gitCommit.substring(0, 8))}`));
      }
      if (contractInfo.gitBranch) {
        console.log(chalk.gray(`  Git Branch:     ${chalk.white(contractInfo.gitBranch)}`));
      }
      if (contractInfo.gitRemote) {
        console.log(chalk.gray(`  Git Remote:     ${chalk.white(contractInfo.gitRemote)}`));
      }
      if (contractInfo.rustVersion) {
        console.log(chalk.gray(`  Rust Version:   ${chalk.white(contractInfo.rustVersion)}`));
      }
      if (contractInfo.sorobanVersion) {
        console.log(chalk.gray(`  Soroban CLI:    ${chalk.white(contractInfo.sorobanVersion)}`));
      }
      
      console.log(chalk.dim('\n─'.repeat(60) + '\n'));

      // Step 2: Submit to API
      spinner.start('Submitting verification data to StellarSafe...');
      
      let response;
      try {
        const apiClient = new ApiClient(options.apiUrl);
        response = await apiClient.submitVerification(formattedCode, contractInfo);
        spinner.succeed(chalk.green('Verification data submitted'));
      } catch (error) {
        spinner.fail(chalk.red('Failed to submit verification'));
        console.error(chalk.red(`\n✗ Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`));
        process.exit(1);
      }

      // Step 3: Display results
      console.log(chalk.dim('\n─'.repeat(60)));
      console.log(chalk.bold('\n🔍 Verification Results:\n'));

      if (response.checks && response.checks.length > 0) {
        response.checks.forEach((check: VerificationCheck) => {
          const icon = check.passed ? chalk.green('✓') : chalk.red('✗');
          const status = check.passed ? chalk.green('PASSED') : chalk.red('FAILED');
          console.log(`  ${icon} ${chalk.white.bold(check.name.padEnd(20))} ${status}`);
          console.log(`    ${chalk.gray(check.message)}`);
        });
      }

      console.log(chalk.dim('\n─'.repeat(60)));

      // Final status
      if (response.verified) {
        console.log(chalk.bold.green('\n✓ CONTRACT VERIFIED SUCCESSFULLY! 🎉\n'));
        console.log(chalk.green('Your contract has been verified and will receive a verified badge.'));
        
        if (response.contractId) {
          console.log(chalk.cyan(`\nView your contract: ${options.apiUrl}/contract/${response.contractId}\n`));
        }
      } else {
        console.log(chalk.bold.yellow('\n⚠ CONTRACT VERIFICATION COMPLETED WITH ISSUES\n'));
        console.log(chalk.yellow('Your contract did not pass all verification checks.'));
        console.log(chalk.yellow('Please review the issues above and try again.\n'));
        
        // Show common fixes
        const failedChecks = response.checks?.filter((c: VerificationCheck) => !c.passed) || [];
        
        if (failedChecks.some((c: VerificationCheck) => c.name === 'WASM_MATCH')) {
          console.log(chalk.yellow('💡 WASM Mismatch:'));
          console.log(chalk.gray('   - Rebuild your contract: soroban contract build'));
          console.log(chalk.gray('   - Ensure you deployed the correct WASM file\n'));
        }
        
        if (failedChecks.some((c: VerificationCheck) => c.name === 'PUBLIC_SOURCE')) {
          console.log(chalk.yellow('💡 Source Not Public:'));
          console.log(chalk.gray('   - Make sure your Git repository is public'));
          console.log(chalk.gray('   - Push your code: git push origin main\n'));
        }
        
        if (failedChecks.some((c: VerificationCheck) => c.name === 'BUILD_ENV')) {
          console.log(chalk.yellow('💡 Build Environment:'));
          console.log(chalk.gray('   - Install Rust: https://rustup.rs'));
          console.log(chalk.gray('   - Install Soroban CLI: cargo install soroban-cli\n'));
        }
        
        process.exit(1);
      }

    } catch (error) {
      console.error(chalk.red('\n✗ Unexpected error:'));
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      console.log(chalk.yellow('\nIf this problem persists, please report it at:'));
      console.log(chalk.cyan('https://github.com/stellarsafe/stellarsafe/issues\n'));
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Check the status of a verification request')
  .argument('<code>', '6-character verification code')
  .option('-a, --api-url <url>', 'Custom API URL', 'https://stellar-safe-liard.vercel.app')
  .action(async (code: string, options: { apiUrl: string }) => {
    try {
      console.log(chalk.bold.cyan('\n🔍 Checking Verification Status\n'));
      
      const apiClient = new ApiClient(options.apiUrl);
      const spinner = ora('Fetching status...').start();
      
      const status = await apiClient.checkStatus(code.toUpperCase());
      spinner.succeed('Status retrieved');
      
      console.log(chalk.dim('\n─'.repeat(60)));
      console.log(chalk.bold('\n📊 Status Information:\n'));
      console.log(chalk.gray(`  Code:        ${chalk.white(status.code)}`));
      console.log(chalk.gray(`  Contract ID: ${chalk.white(status.contractId)}`));
      console.log(chalk.gray(`  Network:     ${chalk.white(status.network)}`));
      console.log(chalk.gray(`  Status:      ${chalk.white(status.status)}`));
      
      if (status.status === 'COMPLETED' && status.verified !== undefined) {
        const verifiedText = status.verified 
          ? chalk.green('✓ VERIFIED') 
          : chalk.yellow('⚠ NOT VERIFIED');
        console.log(chalk.gray(`  Result:      ${verifiedText}`));
      }
      
      console.log(chalk.dim('\n─'.repeat(60) + '\n'));
      
    } catch (error) {
      console.error(chalk.red('\n✗ Error:'));
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error\n'));
      process.exit(1);
    }
  });

program
  .command('help')
  .description('Display help information')
  .action(() => {
    console.log(chalk.bold.cyan('\n🔒 StellarSafe CLI - Contract Verification Tool\n'));
    console.log(chalk.dim('═'.repeat(60)) + '\n');
    
    console.log(chalk.bold('📖 Quick Start:\n'));
    console.log('1. Deploy your contract to Stellar');
    console.log('2. Visit https://stellar-safe-liard.vercel.app/developer');
    console.log('3. Enter your contract ID and generate a code');
    console.log('4. Run: stellarsafe verify YOUR_CODE\n');
    
    console.log(chalk.bold('💡 Commands:\n'));
    console.log(chalk.cyan('  stellarsafe verify <code>'));
    console.log('    Verify your contract using a 6-digit code\n');
    
    console.log(chalk.cyan('  stellarsafe status <code>'));
    console.log('    Check verification status\n');
    
    console.log(chalk.bold('🔧 Options:\n'));
    console.log(chalk.gray('  -d, --directory <path>  Contract directory (default: current)'));
    console.log(chalk.gray('  -a, --api-url <url>     Custom API URL\n'));
    
    console.log(chalk.bold('📚 Examples:\n'));
    console.log(chalk.gray('  stellarsafe verify X7K9M2'));
    console.log(chalk.gray('  stellarsafe verify X7K9M2 --directory ./my-contract'));
    console.log(chalk.gray('  stellarsafe status X7K9M2\n'));
    
    console.log(chalk.bold('🌐 Resources:\n'));
    console.log(chalk.gray('  Website:      https://stellar-safe-liard.vercel.app'));
    console.log(chalk.gray('  Documentation: https://stellarsafe.io/docs'));
    console.log(chalk.gray('  GitHub:       https://github.com/stellarsafe/stellarsafe'));
    console.log(chalk.gray('  Support:      hello@stellarsafe.io\n'));
  });

// Show help if no command provided
if (process.argv.length === 2) {
  console.log(chalk.bold.cyan('\n🔒 StellarSafe CLI - Contract Verification Tool\n'));
  console.log(chalk.dim('═'.repeat(60)) + '\n');
  
  console.log(chalk.bold('📖 Quick Start:\n'));
  console.log('1. Deploy your contract to Stellar');
  console.log('2. Visit https://stellarsafe.io/developer');
  console.log('3. Enter your contract ID and generate a code');
  console.log('4. Run: stellarsafe verify YOUR_CODE\n');
  
  console.log(chalk.bold('💡 Commands:\n'));
  console.log(chalk.cyan('  stellarsafe verify <code>'));
  console.log('    Verify your contract using a 6-digit code\n');
  
  console.log(chalk.cyan('  stellarsafe status <code>'));
  console.log('    Check verification status\n');
  
  console.log(chalk.bold('📚 Examples:\n'));
  console.log(chalk.gray('  stellarsafe verify X7K9M2'));
  console.log(chalk.gray('  stellarsafe verify X7K9M2 --directory ./my-contract'));
  console.log(chalk.gray('  stellarsafe status X7K9M2\n'));
  
  console.log(chalk.gray('Run "stellarsafe help" for more information\n'));
  process.exit(0);
}

program.parse();

