/**
 * Export Storybook to PDF
 *
 * Captures all stories from a static Storybook build and generates a PDF document.
 *
 * Usage:
 *   npx tsx scripts/export-storybook-pdf.ts <storybook-static-path> [output.pdf]
 *
 * Example:
 *   npx tsx scripts/export-storybook-pdf.ts ../projects/winning-11/design-system/storybook-static ./winning-11-design-system.pdf
 */

import * as fs from "fs";
import * as path from "path";
import { spawn, ChildProcess } from "child_process";

interface StoryEntry {
  id: string;
  title: string;
  name: string;
  type: "story" | "docs";
  importPath: string;
}

interface StorybookIndex {
  v: number;
  entries: Record<string, StoryEntry>;
}

interface ExportOptions {
  storybookPath: string;
  outputPath: string;
  serverPort?: number;
  width?: number;
  height?: number;
  includesDocs?: boolean;
}

async function exportStorybookToPdf(options: ExportOptions): Promise<void> {
  const {
    storybookPath,
    outputPath,
    serverPort = 6007,
    width = 1200,
    height = 800,
    includesDocs = false,
  } = options;

  console.log("📄 Storybook PDF Exporter");
  console.log("=========================\n");

  // Validate storybook path
  const indexJsonPath = path.join(storybookPath, "index.json");
  if (!fs.existsSync(indexJsonPath)) {
    throw new Error(`Storybook index.json not found at: ${indexJsonPath}`);
  }

  // Read story index
  const indexContent = fs.readFileSync(indexJsonPath, "utf-8");
  const storybookIndex: StorybookIndex = JSON.parse(indexContent);

  // Filter stories (exclude docs unless requested)
  const stories = Object.values(storybookIndex.entries).filter((entry) =>
    includesDocs ? true : entry.type === "story",
  );

  console.log(`📚 Found ${stories.length} stories to export\n`);

  // Group stories by component title for better organization
  const groupedStories = stories.reduce(
    (acc, story) => {
      if (!acc[story.title]) {
        acc[story.title] = [];
      }
      acc[story.title].push(story);
      return acc;
    },
    {} as Record<string, StoryEntry[]>,
  );

  // Start a local server for the storybook
  console.log(`🌐 Starting local server on port ${serverPort}...`);

  const absoluteStorybookPath = path.resolve(storybookPath);

  // Spawn server as detached process
  const serverProc: ChildProcess = spawn(
    "npx",
    ["serve", absoluteStorybookPath, "-l", String(serverPort)],
    {
      detached: true,
      stdio: "ignore",
    },
  );
  serverProc.unref();

  // Give server time to start
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const baseUrl = `http://localhost:${serverPort}`;

  try {
    // Dynamic import puppeteer
    const puppeteer = await import("puppeteer");

    console.log("🚀 Launching browser...\n");
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width, height });

    // Create PDF document using puppeteer's PDF generation
    const pdfPages: Buffer[] = [];

    // Generate a cover page
    console.log("📝 Generating cover page...");
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
              color: #15803d;
            }
            h1 { font-size: 48px; margin-bottom: 16px; }
            p { font-size: 24px; color: #166534; }
            .date { font-size: 16px; color: #677b52; margin-top: 48px; }
          </style>
        </head>
        <body>
          <h1>Design System</h1>
          <p>Component Library</p>
          <p class="date">Generated: ${new Date().toLocaleDateString()}</p>
        </body>
      </html>
    `);

    const coverPdf = await page.pdf({
      format: "A4",
      printBackground: true,
      landscape: true,
    });
    pdfPages.push(coverPdf);

    // Capture each story
    let storyCount = 0;
    const totalStories = stories.length;

    for (const [title, storyGroup] of Object.entries(groupedStories)) {
      // Add section header page
      await page.setContent(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: #fefefe;
                color: #1a2e05;
              }
              h2 { font-size: 36px; margin-bottom: 24px; color: #15803d; }
              .stories { font-size: 18px; color: #677b52; }
            </style>
          </head>
          <body>
            <h2>${title}</h2>
            <p class="stories">${storyGroup.length} variants</p>
          </body>
        </html>
      `);

      const sectionPdf = await page.pdf({
        format: "A4",
        printBackground: true,
        landscape: true,
      });
      pdfPages.push(sectionPdf);

      // Capture each story in the group
      for (const story of storyGroup) {
        storyCount++;
        const progress = Math.round((storyCount / totalStories) * 100);
        process.stdout.write(
          `\r📸 Capturing stories... ${progress}% (${storyCount}/${totalStories})`,
        );

        const storyUrl = `${baseUrl}/iframe.html?id=${story.id}&viewMode=story`;

        try {
          await page.goto(storyUrl, {
            waitUntil: "networkidle2",
            timeout: 15000,
          });

          // Wait for any animations to settle
          await new Promise((resolve) => setTimeout(resolve, 300));

          // Add story title overlay
          await page.evaluate((storyName: string) => {
            const overlay = document.createElement("div");
            overlay.style.cssText = `
              position: fixed;
              bottom: 16px;
              right: 16px;
              background: rgba(21, 128, 61, 0.9);
              color: white;
              padding: 8px 16px;
              border-radius: 8px;
              font-family: Inter, sans-serif;
              font-size: 14px;
              z-index: 99999;
            `;
            overlay.textContent = storyName;
            document.body.appendChild(overlay);
          }, story.name);

          // Wrap PDF generation in a timeout
          const pdfPromise = page.pdf({
            format: "A4",
            printBackground: true,
            landscape: true,
            margin: {
              top: "20px",
              bottom: "20px",
              left: "20px",
              right: "20px",
            },
          });

          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("PDF timeout")), 10000),
          );

          const storyPdf = await Promise.race([pdfPromise, timeoutPromise]);
          pdfPages.push(storyPdf);
        } catch (error) {
          // Skip failed stories silently to avoid cluttering output
        }
      }
    }

    console.log("\n\n📋 Merging PDF pages...");

    // Use pdf-lib to merge all pages
    const { PDFDocument } = await import("pdf-lib");
    const mergedPdf = await PDFDocument.create();

    for (const pdfBuffer of pdfPages) {
      const pdf = await PDFDocument.load(pdfBuffer);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));
    }

    const finalPdfBytes = await mergedPdf.save();
    fs.writeFileSync(outputPath, finalPdfBytes);

    await browser.close();

    console.log(`\n✅ PDF exported successfully!`);
    console.log(`   📄 ${outputPath}`);
    console.log(`   📊 ${pdfPages.length} pages`);
  } finally {
    // Kill the server
    try {
      if (serverProc.pid) {
        process.kill(-serverProc.pid);
      }
    } catch {
      // Server might already be stopped
    }
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log(`
Storybook PDF Exporter

Usage:
  npx tsx scripts/export-storybook-pdf.ts <storybook-static-path> [output.pdf]

Options:
  storybook-static-path   Path to the built storybook-static folder
  output.pdf              Output PDF file path (default: ./storybook-export.pdf)

Examples:
  npx tsx scripts/export-storybook-pdf.ts ./storybook-static
  npx tsx scripts/export-storybook-pdf.ts ../projects/winning-11/design-system/storybook-static ./winning-11.pdf
`);
    process.exit(1);
  }

  const storybookPath = args[0];
  const outputPath = args[1] || "./storybook-export.pdf";

  exportStorybookToPdf({
    storybookPath,
    outputPath,
  }).catch((error) => {
    console.error("Error:", error.message);
    process.exit(1);
  });
}

export { exportStorybookToPdf };
