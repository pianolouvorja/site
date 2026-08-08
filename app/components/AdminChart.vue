<script setup lang="ts">
  import type { ApexOptions } from 'apexcharts'

  interface ChartProps {
    type: 'area' | 'bar' | 'donut' | 'line'
    series: Array<{ name?: string; data: number[] }>
    categories: string[]
    height?: number
    colors?: string[]
  }

  const props = withDefaults(defineProps<ChartProps>(), {
    height: 280,
    colors: () => ['#22d3ee'],
  })

  const isLine = computed(() => props.type === 'line' || props.type === 'area')

  const chartOptions = computed<ApexOptions>(() => ({
    chart: {
      background: 'transparent',
      foreColor: '#94a3b8',
      toolbar: { show: false },
      fontFamily: 'system-ui, -apple-system, sans-serif',
      animations: { enabled: true, speed: 350 },
    },
    theme: { mode: 'dark' },
    colors: props.colors,
    grid: {
      borderColor: '#1e293b',
      strokeDashArray: 3,
      padding: { left: 10, right: 10 },
    },
    xaxis: {
      categories: props.categories,
      labels: {
        style: { colors: '#64748b', fontSize: '11px' },
        rotate: 0,
        hideOverlappingLabels: true,
      },
      axisBorder: { show: true, color: '#334155' },
      axisTicks: { show: true, color: '#334155' },
    },
    yaxis: {
      labels: { style: { colors: '#64748b', fontSize: '11px' } },
      tickAmount: 5,
      axisBorder: { show: true, color: '#334155' },
      axisTicks: { show: true, color: '#334155' },
    },
    tooltip: { theme: 'dark' },
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth',
      width: isLine.value ? 2 : 0,
    },
    fill:
      props.type === 'area'
        ? {
            type: 'gradient',
            gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 100] },
          }
        : { opacity: 0.85 },
    markers: isLine.value
      ? { size: 4, colors: props.colors, strokeWidth: 0, hover: { size: 6 } }
      : { size: 0 },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      labels: { colors: '#94a3b8' },
    },
    plotOptions:
      props.type === 'bar' ? { bar: { borderRadius: 6, columnWidth: '50%' } } : undefined,
    responsive: [
      {
        breakpoint: 640,
        options: { xaxis: { labels: { style: { fontSize: '10px' }, rotate: -45 } } },
      },
    ],
  }))
</script>

<template>
  <div class="chart-wrapper">
    <ClientOnly>
      <apexchart
        :key="categories.length"
        :type="type"
        :series="series"
        :options="chartOptions"
        :height="height"
      />
      <template #fallback>
        <div class="chart-fallback" :style="{ height: `${height}px` }">
          <i class="ti ti-chart-bar" />
          <span>Carregando grafico...</span>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<style scoped>
  .chart-wrapper {
    width: 100%;
  }

  .chart-fallback {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    color: #334155;
    font-size: 0.875rem;
  }

  .chart-fallback i {
    font-size: 2rem;
  }
</style>
