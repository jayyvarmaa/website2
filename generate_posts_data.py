import os
import json
from pathlib import Path

posts_dir = Path('assets/Posts')
posts_data = []

# Scan all posts folders
for folder in sorted(posts_dir.iterdir()):
    if folder.is_dir():
        post_num = int(folder.name)
        
        # Get all images and videos in folder
        images = sorted([f for f in folder.iterdir() if f.suffix.lower() in ['.png', '.jpg', '.jpeg', '.webp', '.mp4']])
        
        if images:
            num_images = len(images)
            
            # Sort naturally if possible, otherwise string sort
            import re
            def atoi(text):
                return int(text) if text.isdigit() else text
            def natural_keys(text):
                return [ atoi(c) for c in re.split(r'(\d+)', text.name) ]
            
            images.sort(key=natural_keys)

            post_info = {
                'post_num': post_num,
                'folder': folder.name,
                'image_count': num_images,
                'images': [f.name for f in images]
            }
            posts_data.append(post_info)

# Sort by post number (descending - latest first)
posts_data.sort(key=lambda x: x['post_num'], reverse=True)

# Output as JSON
print(json.dumps(posts_data, indent=2))

# Also save to a file for reference
with open('assets/posts_manifest.json', 'w') as f:
    json.dump(posts_data, f, indent=2)

print(f"\n// Generated {len(posts_data)} posts")
