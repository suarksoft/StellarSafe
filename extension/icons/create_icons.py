#!/usr/bin/env python3
"""
Simple script to create placeholder icons using PIL
"""
from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size):
    # Create image with gradient background
    img = Image.new('RGB', (size, size), '#667eea')
    draw = ImageDraw.Draw(img)
    
    # Draw shield shape (simplified)
    shield_color = '#ffffff'
    margin = size // 6
    
    # Draw shield polygon
    points = [
        (size//2, margin),  # top
        (size - margin, margin + size//4),  # top right
        (size - margin, size - margin - size//4),  # bottom right
        (size//2, size - margin),  # bottom point
        (margin, size - margin - size//4),  # bottom left
        (margin, margin + size//4),  # top left
    ]
    draw.polygon(points, fill=shield_color)
    
    # Save
    img.save(f'icon{size}.png', 'PNG')
    print(f'Created icon{size}.png')

# Create all sizes
for size in [16, 32, 48, 128]:
    create_icon(size)

print('All icons created successfully!')
