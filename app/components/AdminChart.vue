<script setup lang="ts">
  import VueApexCharts from 'vue3-apexcharts'

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

  const chartOptions = computed(() => ({
    chart: {
      type: props.type,
      background: 'transparent',
      foreColor: '#94a3b8',
      toolbar: { show: false },
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    theme: { mode: 'dark' as const },
    colors: props.colors,
    grid: {
      borderColor: '#1e293b',
      strokeDashArray: 3,
    },
    xaxis: {
      categories: props.categories,
      labels: { style: { colors: '#64748b', fontSize: '11px' } },
      axisBorder: { color: '#1e293b' },
      axisTicks: { color: '#1e293b' },
    },
    yaxis: {
      labels: { style: { colors: '#64748b', fontSize: '11px' } },
    },
    tooltip: {
      theme: 'dark' as const,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth' as const,
      width: 2,
    },
    fill:
      props.type === 'area'
        ? {
            type: 'gradient',
            gradient: {
              shadeIntensity: 1,
              opacityFrom: 0.3,
              opacityTo: 0.05,
              stops: [0, 100],
            },
          }
        : undefined,
    legend: {
      position: 'top' as const,
      labels: { colors: '#94a3b8' },
    },
    plotOptions:
      props.type === 'bar'
        ? {
            bar: {
              borderRadius: 6,
              columnWidth: '60%',
            },
          }
        : props.type === 'donut'
          ? {
              pie: {
                donut: {
                  size: '70%',
                  labels: {
                    show: true,
                    name: { color: '#94a3b8' },
                    value: { color: '#22d3ee', fontSize: '24px', fontWeight: 700 },
                    total: props.label
                      ? {
                          show: true,
                          label: props.label,
                          color: '#64748b',
                        }
                      : undefined,
                  },
                },
              },
            }
          : undefined,
  }))
</script>

<template>
  <ClientOnly>
    <VueApexCharts :type="type" :series="series" :options="chartOptions" :height="height" />
    <template #fallback>
      <div class="chart-fallback" :style="{ height: `${height}px` }">
        <i class="ti ti-chart-bar" />
      </div>
    </template>
  </ClientOnly>
</template>

<style scoped>
  .chart-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #334155;
    font-size: 2rem;
  }
</style>
