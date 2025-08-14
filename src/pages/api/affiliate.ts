import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const GET: APIRoute = async () => {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'affiliate-products.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    const affiliateData = JSON.parse(data);
    
    return new Response(JSON.stringify(affiliateData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to load affiliate data' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const dataPath = path.join(process.cwd(), 'data', 'affiliate-products.json');
    
    // Lire les données existantes
    const existingData = await fs.readFile(dataPath, 'utf-8');
    const affiliateData = JSON.parse(existingData);
    
    // Ajouter horodatage
    const newItem = {
      ...body,
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };
    
    if (body.type === 'product') {
      affiliateData.products.push(newItem);
    } else if (body.type === 'deal') {
      if (!affiliateData.deals) affiliateData.deals = [];
      affiliateData.deals.push(newItem);
    } else if (body.type === 'partner') {
      if (!affiliateData.partners) affiliateData.partners = [];
      affiliateData.partners.push(newItem);
    }
    
    // Sauvegarder
    await fs.writeFile(dataPath, JSON.stringify(affiliateData, null, 2));
    
    return new Response(JSON.stringify({ success: true, data: newItem }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create item' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { id, type, ...updateData } = body;
    const dataPath = path.join(process.cwd(), 'data', 'affiliate-products.json');
    
    // Lire les données existantes
    const existingData = await fs.readFile(dataPath, 'utf-8');
    const affiliateData = JSON.parse(existingData);
    
    let updated = false;
    
    if (type === 'product') {
      const index = affiliateData.products.findIndex((p: any) => p.id === id);
      if (index !== -1) {
        affiliateData.products[index] = {
          ...affiliateData.products[index],
          ...updateData,
          updated: new Date().toISOString()
        };
        updated = true;
      }
    } else if (type === 'deal') {
      const index = affiliateData.deals?.findIndex((d: any) => d.id === id) ?? -1;
      if (index !== -1) {
        affiliateData.deals[index] = {
          ...affiliateData.deals[index],
          ...updateData,
          updated: new Date().toISOString()
        };
        updated = true;
      }
    } else if (type === 'partner') {
      const index = affiliateData.partners?.findIndex((p: any) => p.id === id) ?? -1;
      if (index !== -1) {
        affiliateData.partners[index] = {
          ...affiliateData.partners[index],
          ...updateData,
          updated: new Date().toISOString()
        };
        updated = true;
      }
    }
    
    if (updated) {
      await fs.writeFile(dataPath, JSON.stringify(affiliateData, null, 2));
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      return new Response(JSON.stringify({ error: 'Item not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to update item' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const type = url.searchParams.get('type');
    
    if (!id || !type) {
      return new Response(JSON.stringify({ error: 'Missing id or type parameter' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    const dataPath = path.join(process.cwd(), 'data', 'affiliate-products.json');
    const existingData = await fs.readFile(dataPath, 'utf-8');
    const affiliateData = JSON.parse(existingData);
    
    let deleted = false;
    
    if (type === 'product') {
      const index = affiliateData.products.findIndex((p: any) => p.id === id);
      if (index !== -1) {
        affiliateData.products.splice(index, 1);
        deleted = true;
      }
    } else if (type === 'deal') {
      const index = affiliateData.deals?.findIndex((d: any) => d.id === id) ?? -1;
      if (index !== -1) {
        affiliateData.deals.splice(index, 1);
        deleted = true;
      }
    } else if (type === 'partner') {
      const index = affiliateData.partners?.findIndex((p: any) => p.id === id) ?? -1;
      if (index !== -1) {
        affiliateData.partners.splice(index, 1);
        deleted = true;
      }
    }
    
    if (deleted) {
      await fs.writeFile(dataPath, JSON.stringify(affiliateData, null, 2));
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      return new Response(JSON.stringify({ error: 'Item not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to delete item' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
