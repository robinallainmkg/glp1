import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'product' | 'partner'
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Validation du fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return new Response(JSON.stringify({ error: 'File too large. Maximum size is 5MB.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const filename = `${type}-${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // Déterminer le dossier de destination
    let uploadDir: string;
    if (type === 'product') {
      uploadDir = path.join(process.cwd(), 'public', 'images', 'products');
    } else if (type === 'partner') {
      uploadDir = path.join(process.cwd(), 'public', 'images', 'partners');
    } else {
      uploadDir = path.join(process.cwd(), 'public', 'images', 'uploads');
    }
    
    // Créer le dossier s'il n'existe pas
    await fs.mkdir(uploadDir, { recursive: true });
    
    // Sauvegarder le fichier
    const filePath = path.join(uploadDir, filename);
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(arrayBuffer));
    
    // URL publique relative
    let publicUrl: string;
    if (type === 'product') {
      publicUrl = `/images/products/${filename}`;
    } else if (type === 'partner') {
      publicUrl = `/images/partners/${filename}`;
    } else {
      publicUrl = `/images/uploads/${filename}`;
    }
    
    return new Response(JSON.stringify({
      success: true,
      url: publicUrl,
      filename: filename,
      size: file.size,
      type: file.type
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ error: 'Upload failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
