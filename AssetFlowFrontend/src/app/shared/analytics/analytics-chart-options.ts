export function baseChartOptions(showLegend = true) {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--text-color');
  const textMuted = documentStyle.getPropertyValue('--text-color-secondary');
  const borderColor = documentStyle.getPropertyValue('--surface-border');
  return {
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: textColor }, display: showLegend },
      tooltip: { enabled: true }
    },
    scales: {
      x: { ticks: { color: textMuted }, grid: { color: borderColor } },
      y: { ticks: { color: textMuted }, grid: { color: borderColor } }
    }
  };
}

export const chartPalette = ['#42A5F5', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC', '#26A69A', '#8D6E63', '#78909C'];
