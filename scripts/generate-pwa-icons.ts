/**
 * Skrypt do generowania ikon PWA z obrazu źródłowego
 * 
 * Wymaga zainstalowanego sharp:
 * pnpm add -D sharp
 * 
 * Użycie:
 * pnpm tsx scripts/generate-pwa-icons.ts
 */

import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = join(process.cwd(), 'public');
const iconsDir = join(publicDir, 'icons');
const sourceIconPath = join(publicDir, 'source-icon.png');
const faviconPath = join(publicDir, 'favicon.svg');

async function generateIcons() {
  try {
    // Sprawdź czy plik źródłowy istnieje
    if (!existsSync(sourceIconPath)) {
      console.error(`❌ Błąd: Nie znaleziono pliku źródłowego: ${sourceIconPath}`);
      process.exit(1);
    }

    // Utwórz folder icons jeśli nie istnieje
    mkdirSync(iconsDir, { recursive: true });

    // Wczytaj obraz źródłowy i przetwórz - zamień czarne elementy (sztanga, strzałka) na białe
    console.log('Przetwarzanie obrazu źródłowego - zamiana czarnych elementów na białe...');
    const sourceImage = sharp(sourceIconPath);
    const { data, info } = await sourceImage
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Przetwórz piksele - zamień ciemne piksele (sztanga, strzałka) na białe
    // Zachowaj niebieskie tło i przezroczystość
    const pixels = new Uint8Array(data);
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];
      
      // Jeśli piksel jest przezroczysty, zostaw go
      if (a === 0) continue;
      
      // Sprawdź czy piksel jest niebieski (tło) - jeśli tak, zostaw go
      // Niebieskie tło ma wysokie wartości B i niższe R, G
      const isBlue = b > r && b > g && b > 100;
      
      // Jeśli piksel nie jest niebieski i jest ciemny (czarny/szary), zamień na biały
      if (!isBlue && (r < 100 && g < 100 && b < 100)) {
        pixels[i] = 255;     // R - biały
        pixels[i + 1] = 255; // G - biały
        pixels[i + 2] = 255; // B - biały
        // Alpha pozostaje bez zmian
      }
    }

    // Stwórz przetworzony obraz
    const processedImageBuffer = await sharp(pixels, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4
      }
    })
    .png()
    .toBuffer();

    console.log('✓ Obraz źródłowy przetworzony');

    console.log('Generowanie ikon PWA...');

    // Generuj ikony dla każdego rozmiaru
    for (const size of sizes) {
      const outputPath = join(iconsDir, `icon-${size}x${size}.png`);

      await sharp(processedImageBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }, // Przezroczyste tło
        })
        .png()
        .toFile(outputPath);

      console.log(`✓ Wygenerowano icon-${size}x${size}.png`);
    }

    // Generuj favicon.svg z obrazu źródłowego
    console.log('\nGenerowanie favicon.svg...');
    const pngBuffer = await sharp(processedImageBuffer)
      .resize(128, 128, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }, // Przezroczyste tło
      })
      .png()
      .toBuffer();

    // Konwertuj PNG do SVG (używamy prostego SVG wrapper)
    const base64 = pngBuffer.toString('base64');
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 128 128">
  <image width="128" height="128" xlink:href="data:image/png;base64,${base64}"/>
</svg>`;

    writeFileSync(faviconPath, svgContent);
    console.log('✓ Wygenerowano favicon.svg');

    // Generuj PNG favicony (16x16 i 32x32)
    console.log('\nGenerowanie PNG faviconów...');
    const favicon16Path = join(publicDir, 'favicon-16x16.png');
    const favicon32Path = join(publicDir, 'favicon-32x32.png');

    await sharp(processedImageBuffer)
      .resize(16, 16, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }, // Przezroczyste tło
      })
      .png()
      .toFile(favicon16Path);
    console.log('✓ Wygenerowano favicon-16x16.png');

    await sharp(processedImageBuffer)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }, // Przezroczyste tło
      })
      .png()
      .toFile(favicon32Path);
    console.log('✓ Wygenerowano favicon-32x32.png');

    console.log('\n✅ Wszystkie ikony zostały wygenerowane!');
    console.log(`📁 Lokalizacja: ${iconsDir}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Cannot find module')) {
      console.error(
        '\n❌ Błąd: Brak modułu sharp.\n' +
        'Zainstaluj go poleceniem: pnpm add -D sharp\n'
      );
    } else {
      console.error('❌ Błąd podczas generowania ikon:', error);
    }
    process.exit(1);
  }
}

generateIcons();
