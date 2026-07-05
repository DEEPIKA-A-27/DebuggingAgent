const PDFDocument = require('pdfkit');

/**
 * Generate PDF report for debug analysis
 */
function generatePDFReport({ userName, analysis, language, originalCode, date }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(22).fillColor('#2563eb').text('AI Debugging Agent Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).fillColor('#666666');
      doc.text(`User: ${userName}`);
      doc.text(`Date: ${date}`);
      doc.text(`Language: ${language}`);
      doc.moveDown();

      // Original Code
      addSection(doc, 'Original Code', originalCode);

      // Syntax Errors
      if (analysis.syntaxErrors?.length) {
        addSection(doc, 'Syntax Errors', formatErrors(analysis.syntaxErrors));
      }

      // Logical Errors
      if (analysis.logicalErrors?.length) {
        addSection(doc, 'Logical Errors', formatErrors(analysis.logicalErrors));
      }

      // Corrected Code
      if (analysis.correctedCode) {
        addSection(doc, 'Corrected Code', analysis.correctedCode);
      }

      // Optimized Code
      if (analysis.optimizedCode) {
        addSection(doc, 'Optimized Code', analysis.optimizedCode);
      }

      // Optimization Explanation
      if (analysis.optimizationExplanation) {
        addSection(doc, 'Optimization Explanation', analysis.optimizationExplanation);
      }

      // Test Cases
      if (analysis.testCases?.length) {
        addSection(doc, 'Test Cases', formatTestCases(analysis.testCases));
      }

      // Boundary Test Cases
      if (analysis.boundaryTestCases?.length) {
        addSection(doc, 'Boundary Test Cases', formatTestCases(analysis.boundaryTestCases));
      }

      // Edge Test Cases
      if (analysis.edgeTestCases?.length) {
        addSection(doc, 'Edge Test Cases', formatTestCases(analysis.edgeTestCases));
      }

      // Expected Outputs
      if (analysis.expectedOutputs?.length) {
        addSection(doc, 'Expected Outputs', analysis.expectedOutputs.map((o, i) => `${i + 1}. ${o}`).join('\n'));
      }

      // Complexity
      doc.moveDown();
      doc.fontSize(12).fillColor('#2563eb').text('Complexity Analysis');
      doc.fontSize(10).fillColor('#333333');
      doc.text(`Time Complexity: ${analysis.timeComplexity || 'Unknown'}`);
      doc.text(`Space Complexity: ${analysis.spaceComplexity || 'Unknown'}`);
      doc.moveDown();

      // Best Practices
      if (analysis.bestPractices?.length) {
        addSection(doc, 'Best Practices', analysis.bestPractices.map((p, i) => `${i + 1}. ${p}`).join('\n'));
      }

      // Learning Recommendations
      if (analysis.learningTopics?.length) {
        addSection(doc, 'Learning Recommendations', analysis.learningTopics.map((t, i) => `${i + 1}. ${t}`).join('\n'));
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function addSection(doc, title, content) {
  doc.moveDown(0.5);
  doc.fontSize(14).fillColor('#2563eb').text(title);
  doc.moveDown(0.3);
  doc.fontSize(9).fillColor('#333333').text(content || 'N/A', { lineGap: 2 });
}

function formatErrors(errors) {
  return errors
    .map((e, i) => {
      const line = e.line ? `Line ${e.line}: ` : '';
      const explanation = e.explanation ? `\n   Explanation: ${e.explanation}` : '';
      return `${i + 1}. ${line}${e.message || e}${explanation}`;
    })
    .join('\n\n');
}

function formatTestCases(cases) {
  return cases
    .map((tc, i) => {
      const desc = tc.description ? ` - ${tc.description}` : '';
      return `${i + 1}. Input: ${tc.input || tc}${desc}`;
    })
    .join('\n');
}

module.exports = { generatePDFReport };
