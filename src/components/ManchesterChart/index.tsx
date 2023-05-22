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

const options: LineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  resizeDelay: 0,
  scales: {
    y: {
      display: false,
    },
    x: {
      display: false,
      // max: MAX_CHART_ITEMS,
      ticks: {
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
      grid: {
        color: 'white',
        tickColor: 'grey',
        z: 10,
        lineWidth(ctx) {
          if (ctx.index == 0) return 0
          return ctx.index % 2 == 0 ? 1 : 0
        },
      },
      ticks: {
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
}

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
          options={options}
          data={{
            labels,
            datasets: [
              {
                label: 'Manchester',
                data: chartData,
                borderColor: 'rgba(255, 99, 132, 0.5)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
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
