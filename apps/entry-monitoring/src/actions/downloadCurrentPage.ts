export const downloadCurrentPage = () => {
  const documentSnapshot = document.documentElement.cloneNode(true) as HTMLElement;
  const canvases = document.querySelectorAll("canvas");
  const snapshotCanvases = documentSnapshot.querySelectorAll("canvas");

  canvases.forEach((canvas, index) => {
    const snapshotCanvas = snapshotCanvases[index];

    if (!snapshotCanvas) return;

    const chartImage = document.createElement("img");
    chartImage.src = canvas.toDataURL("image/png");
    chartImage.alt = canvas.getAttribute("aria-label") ?? "Chart";
    chartImage.width = canvas.width;
    chartImage.height = canvas.height;
    chartImage.className = canvas.className;
    chartImage.setAttribute("style", canvas.getAttribute("style") ?? "");
    snapshotCanvas.replaceWith(chartImage);
  });

  documentSnapshot.querySelectorAll("script").forEach(script => script.remove());

  const html = `<!DOCTYPE html>\n${documentSnapshot.outerHTML}`;
  const file = new Blob([html], { type: "text/html;charset=utf-8" });
  const downloadUrl = URL.createObjectURL(file);
  const downloadLink = document.createElement("a");

  downloadLink.href = downloadUrl;
  downloadLink.download = "entry-monitoring.html";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
};
