import React, { useEffect, useRef } from 'react';

export default function OwnershipTree({ chain, source }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (chain.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size
    const padding = 40;
    const nodeWidth = 180;
    const nodeHeight = 60;
    const verticalGap = 100;

    canvas.width = Math.max(400, nodeWidth + padding * 2);
    canvas.height = chain.length * verticalGap + padding * 2;

    // Draw background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw tree structure
    const nodePositions = [];

    // Draw nodes
    chain.forEach((item, index) => {
      const x = padding + (canvas.width - padding * 2) / 2 - nodeWidth / 2;
      const y = padding + index * verticalGap;

      nodePositions.push({ x, y });

      // Draw connecting line to parent
      if (index > 0) {
        const prevX = nodePositions[index - 1].x + nodeWidth / 2;
        const prevY = nodePositions[index - 1].y + nodeHeight;
        const currX = x + nodeWidth / 2;

        ctx.strokeStyle = '#6c757d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(prevX, prevY + (verticalGap - nodeHeight) / 2);
        ctx.lineTo(currX, prevY + (verticalGap - nodeHeight) / 2);
        ctx.lineTo(currX, y);
        ctx.stroke();

        // Draw arrow
        const arrowSize = 8;
        const angle = Math.PI / 2;
        ctx.fillStyle = '#6c757d';
        ctx.beginPath();
        ctx.moveTo(currX, y);
        ctx.lineTo(currX - arrowSize * Math.cos(angle - Math.PI / 6), y - arrowSize * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(currX - arrowSize * Math.cos(angle + Math.PI / 6), y - arrowSize * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      }

      // Draw node box
      const isRoot = index === 0;
      ctx.fillStyle = isRoot ? '#007bff' : '#17a2b8';
      ctx.fillRect(x, y, nodeWidth, nodeHeight);

      // Draw border
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, nodeWidth, nodeHeight);

      // Draw text
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const lines = wrapText(item.label, nodeWidth - 10);
      const lineHeight = 16;
      const totalHeight = lines.length * lineHeight;
      const startY = y + nodeHeight / 2 - totalHeight / 2;

      lines.forEach((line, lineIndex) => {
        ctx.fillText(line, x + nodeWidth / 2, startY + lineIndex * lineHeight + lineHeight / 2);
      });

      // Draw confidence badge
      const confidence = item.confidence;
      if (confidence && confidence < 1) {
        ctx.fillStyle = '#ffc107';
        ctx.font = '11px Arial';
        ctx.fillText(
          `${Math.round(confidence * 100)}% confident`,
          x + nodeWidth / 2,
          y + nodeHeight - 10
        );
      }
    });

    // Draw source indicator
    ctx.fillStyle = '#6c757d';
    ctx.font = '11px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Data source: ${source}`, padding, canvas.height - 10);
  }, [chain, source]);

  if (chain.length === 0) {
    return <div className="ownership-tree empty">No ownership data available</div>;
  }

  return (
    <div className="ownership-tree">
      <canvas ref={canvasRef} className="tree-canvas"></canvas>
    </div>
  );
}

/**
 * Wrap text to fit within width
 */
function wrapText(text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    // Rough estimate: ~2 pixels per character at 14px font
    if (testLine.length * 8 < maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines;
}
