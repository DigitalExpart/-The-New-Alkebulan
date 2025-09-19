-- Add sample product variants to test the variant selection functionality
-- This script adds variants for existing products

-- First, let's check what products we have and update them to have variants
UPDATE public.products 
SET has_variants = true 
WHERE id IN (
    SELECT id FROM public.products 
    WHERE status = 'active' 
    LIMIT 2
);

-- Add color variants for the first product
INSERT INTO public.product_variants (
    product_id,
    variant_type,
    variant_value,
    variant_display_name,
    additional_price,
    inventory,
    is_available,
    hex_color,
    sort_order
) 
SELECT 
    p.id,
    'color',
    'red',
    'Red',
    0.00,
    50,
    true,
    '#FF0000',
    1
FROM public.products p 
WHERE p.status = 'active' 
LIMIT 1;

INSERT INTO public.product_variants (
    product_id,
    variant_type,
    variant_value,
    variant_display_name,
    additional_price,
    inventory,
    is_available,
    hex_color,
    sort_order
) 
SELECT 
    p.id,
    'color',
    'blue',
    'Blue',
    5.00,
    30,
    true,
    '#0000FF',
    2
FROM public.products p 
WHERE p.status = 'active' 
LIMIT 1;

INSERT INTO public.product_variants (
    product_id,
    variant_type,
    variant_value,
    variant_display_name,
    additional_price,
    inventory,
    is_available,
    hex_color,
    sort_order
) 
SELECT 
    p.id,
    'color',
    'green',
    'Green',
    0.00,
    25,
    true,
    '#00FF00',
    3
FROM public.products p 
WHERE p.status = 'active' 
LIMIT 1;

-- Add size variants for the same product
INSERT INTO public.product_variants (
    product_id,
    variant_type,
    variant_value,
    variant_display_name,
    additional_price,
    inventory,
    is_available,
    sort_order
) 
SELECT 
    p.id,
    'size',
    'small',
    'Small',
    0.00,
    20,
    true,
    1
FROM public.products p 
WHERE p.status = 'active' 
LIMIT 1;

INSERT INTO public.product_variants (
    product_id,
    variant_type,
    variant_value,
    variant_display_name,
    additional_price,
    inventory,
    is_available,
    sort_order
) 
SELECT 
    p.id,
    'size',
    'medium',
    'Medium',
    10.00,
    40,
    true,
    2
FROM public.products p 
WHERE p.status = 'active' 
LIMIT 1;

INSERT INTO public.product_variants (
    product_id,
    variant_type,
    variant_value,
    variant_display_name,
    additional_price,
    inventory,
    is_available,
    sort_order
) 
SELECT 
    p.id,
    'size',
    'large',
    'Large',
    15.00,
    35,
    true,
    3
FROM public.products p 
WHERE p.status = 'active' 
LIMIT 1;

-- Add weight variants for the second product
INSERT INTO public.product_variants (
    product_id,
    variant_type,
    variant_value,
    variant_display_name,
    additional_price,
    inventory,
    is_available,
    sort_order
) 
SELECT 
    p.id,
    'weight',
    '1kg',
    '1 kg',
    0.00,
    15,
    true,
    1
FROM public.products p 
WHERE p.status = 'active' 
OFFSET 1 LIMIT 1;

INSERT INTO public.product_variants (
    product_id,
    variant_type,
    variant_value,
    variant_display_name,
    additional_price,
    inventory,
    is_available,
    sort_order
) 
SELECT 
    p.id,
    'weight',
    '2kg',
    '2 kg',
    25.00,
    20,
    true,
    2
FROM public.products p 
WHERE p.status = 'active' 
OFFSET 1 LIMIT 1;

INSERT INTO public.product_variants (
    product_id,
    variant_type,
    variant_value,
    variant_display_name,
    additional_price,
    inventory,
    is_available,
    sort_order
) 
SELECT 
    p.id,
    'weight',
    '5kg',
    '5 kg',
    50.00,
    10,
    true,
    3
FROM public.products p 
WHERE p.status = 'active' 
OFFSET 1 LIMIT 1;

-- Add model/number variants for the second product
INSERT INTO public.product_variants (
    product_id,
    variant_type,
    variant_value,
    variant_display_name,
    additional_price,
    inventory,
    is_available,
    sort_order
) 
SELECT 
    p.id,
    'number',
    'model-a',
    'Model A',
    0.00,
    12,
    true,
    1
FROM public.products p 
WHERE p.status = 'active' 
OFFSET 1 LIMIT 1;

INSERT INTO public.product_variants (
    product_id,
    variant_type,
    variant_value,
    variant_display_name,
    additional_price,
    inventory,
    is_available,
    sort_order
) 
SELECT 
    p.id,
    'number',
    'model-b',
    'Model B',
    30.00,
    8,
    true,
    2
FROM public.products p 
WHERE p.status = 'active' 
OFFSET 1 LIMIT 1;

-- Verify the variants were added
SELECT 
    p.name as product_name,
    pv.variant_type,
    pv.variant_value,
    pv.variant_display_name,
    pv.additional_price,
    pv.inventory,
    pv.hex_color
FROM public.products p
JOIN public.product_variants pv ON p.id = pv.product_id
WHERE p.has_variants = true
ORDER BY p.name, pv.variant_type, pv.sort_order;
