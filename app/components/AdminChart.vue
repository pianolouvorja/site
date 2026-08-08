<script setup lang="ts">
  import { defineAsyncComponent } from 'vue'

  interface ChartProps {
    type: 'area' | 'bar' | 'donut' | 'line'
    series: Array<{ name?: string; data: number[] }>
    categories: string[]
    height?: number
    colors?: string[]
    label?: string
  }

  const props = withDefaults(defineProps<ChartProps>(), {
    height: 280,
    colors: () => ['#22d3ee'],
    label: '',
  })

  // Lazy load apenas no client
  const ApexChart = defineAsyncComponent(() => import('vue3-apexcharts').then((m) => m.default))

  const chartOptions = {
    chart: {
      background: 'transparent',
      foreColor: '#94a3b8',
      toolbar: { show: false },
      fontFamily: 'system-ui, -apple-system, sans-serif',
      animations: { enabled: true, speed: 350 },
    },
    theme: { mode: 'dark' as const },
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
      axisBorder: { show: true, color: '#1e293b' },
      axisTicks: { show: true, color: '#1e293b' },
    },
    yaxis: {
      labels: { style: { colors: '#64748b', fontSize: '11px' } },
      tickAmount: 5,
    },
    tooltip: {
      theme: 'dark' as const,
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: 'smooth' as const,
      width: props.type === 'line' || props.type === 'area' ? 2 : 0,
    },
    fill:
      props.type === 'area'
        ? {
            type: 'gradient',
            gradient: {
              shadeIntensity: 1,
              opacityFrom: 0.35,
              opacityTo: 0.05,
              stops: [0, 100],
            },
          }
        : { opacity: 0.85 },
    markers:
      props.type === 'line' || props.type === 'area'
        ? {
            size: 4,
            colors: props.colors,
            strokeWidth: 0,
            hover: { size: 6 },
          }
        : { size: 0 },
    legend: {
      position: 'top' as const,
      horizontalAlign: 'right' as const,
      labels: { colors: '#94a3b8' },
    },
    plotOptions:
      props.type === 'bar'
        ? {
            bar: {
              borderRadius: 6,
              columnWidth: '50%',
            },
          }
        : undefined,
    responsive: [
      {
        breakpoint: 640,
        options: {
          xaxis: {
            labels: { style: { fontSize: '10px' }, rotate: -45 },
          },
        },
      },
    ],
  }
</script>

<template>
  <div class="chart-wrapper" :style="{ minHeight: `${height}px` }">
    <ClientOnly>
      <component
        :is="ApexChart"
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
