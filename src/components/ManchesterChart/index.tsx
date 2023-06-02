import {
  CategoryScale,
  Chart as ChartJS,
  CoreChartOptions,
  DatasetChartOptions,
  ElementChartOptions,
  LineControllerChartOptions,
  LineElement,
  LinearScale,
  PluginChartOptions,
  PointElement,
  ScaleChartOptions,
  Title,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

import { _DeepPartialObject } from 'chart.js/dist/types/utils'
import { useMemo } from 'react'
import { useColorScheme } from '../../hooks/useColorScheme'
import './styles.css'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title)

type LineOptions = _DeepPartialObject<
  CoreChartOptions<'line'> &
    ElementChartOptions<'line'> &
    PluginChartOptions<'line'> &
    DatasetChartOptions<'line'> &
    ScaleChartOptions<'line'> &
    LineControllerChartOptions
>

const getChartOptions = (isDarkTheme: boolean = false) =>
  ({
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    resizeDelay: 0,
    scales: {
      y: {
        min: -1,
        max: 1,
        ticks: {
          stepSize: 1,
          font: {
            size: 16,
            weight: '900',
          },
        },
        grid: {
          color: isDarkTheme ? 'rgb(255 255 255 / 0.2)' : 'rgb(0 0 0 / 0.2)',
          z: 10,
          lineWidth(ctx) {
            if (ctx.index == 0) return 0
            return ctx.tick.value == 0 ? 1 : 0
          },
        },
      },
      x: {
        display: false,
        // max: MAX_CHART_ITEMS,
        ticks: {
          font: {
            size: 16,
            weight: '900',
          },
          callback(value) {
            const index = value as number
            const realLabel = this.getLabelForValue(index)
            if (!realLabel) return ''

            const manchesterEncodedMessageBit = realLabel.split(';')[0]
            return manchesterEncodedMessageBit
          },
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      xAxis2: {
        type: 'category',
        // max: MAX_CHART_ITEMS,
        border: {
          dash: [10, 10],
        },
        grid: {
          color: isDarkTheme ? `rgb(255 255 255 / 1)` : `rgb(0 0 0 / 1)`,
          z: 10,
          lineWidth(ctx) {
            if (ctx.index == 0) return 0
            return ctx.index % 2 == 0 ? 2 : 0
          },
        },
        ticks: {
          font: {
            size: 16,
            weight: '900',
          },
          callback(value) {
            const index = value as number
            const realLabel = this.getLabelForValue(index)
            if (!realLabel) return ''

            const binaryMessageBit = realLabel.split(';')[1]
            if (index % 2 === 1) {
              return binaryMessageBit
            } else {
              return ''
            }
          },
        },
      },
    },
  } as LineOptions)

const MIN_ITEMS_TO_DYNAMICALLY_RESIZE = 40
const MAX_ITEM_WIDTH = 35

interface ManchesterLineChartProps {
  labels: string[]
  chartData: number[]
}

export function ManchesterLineChart({
  labels,
  chartData,
}: ManchesterLineChartProps) {
  const isChartTooBig = chartData.length > MIN_ITEMS_TO_DYNAMICALLY_RESIZE
  const chartWidth =
    MAX_ITEM_WIDTH * (chartData.length - MIN_ITEMS_TO_DYNAMICALLY_RESIZE)

  const colorScheme = useColorScheme()

  const chartOptions = useMemo(
    () => getChartOptions(colorScheme === 'dark'),
    [colorScheme]
  )

  return (
    <div className="chart-container">
      <div
        className="chart-body"
        style={{
          width: isChartTooBig ? `calc(100% + ${chartWidth}px)` : '100%',
        }}
      >
        <Line
          title="Gráfico Codificação Manchester"
          options={chartOptions}
          data={{
            labels,
            datasets: [
              {
                label: 'Manchester',
                data: chartData,
                borderColor: 'rgb(255 63 52)',
                backgroundColor: 'rgb(255 63 52)',
                stepped: true,
                pointRadius: 0,
              },
            ],
          }}
        />
      </div>
    </div>
  )
}
