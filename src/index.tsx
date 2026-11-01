import { Gauge as GaugeIcon } from 'lucide-react';
import {
  definePanel,
  defineWidget,
  NumberField,
  PanelSettings,
  PanelStatus,
  TextField,
  TopicInput,
  TreeField,
  TreeSection,
  useTopic,
  type PanelProps,
} from '@miti/sdk';

interface GaugeConfig {
  topic: string;
  /** Path of the number in the message, e.g. `position[0]` or `pose.pose.position.x`. */
  field: string;
  min: number;
  max: number;
  unit: string;
}

const DEFAULTS: GaugeConfig = {
  topic: '/joint_states',
  field: 'position[0]',
  min: -3.14,
  max: 3.14,
  unit: 'rad',
};

/** The value at `field` in a message, or undefined when the message has no such field. */
function readField(message: unknown, field: string): unknown {
  return field
    .split(/\.|\[(\d+)\]/)
    .filter(Boolean)
    .reduce<unknown>(
      (value, key) => (value == null ? undefined : (value as Record<string, unknown>)[key]),
      message
    );
}

const format = (value: number) =>
  Math.abs(value) >= 1000 ? value.toFixed(0) : value.toPrecision(3).replace(/\.?0+$/, '');

// A 240° arc over the top of a circle centred at (100, 95).
const ARC = 'M 35.05 132.5 A 75 75 0 1 1 164.95 132.5';
const label = { fill: 'var(--miti-text-secondary)', fontSize: 11, textAnchor: 'middle' } as const;

function Gauge({ client, topics, config, updateConfig }: PanelProps<GaugeConfig>) {
  // A dial cannot show more than ten updates a second; skip decoding the rest.
  const { data } = useTopic(client, config.topic, undefined, { throttleRate: 100 });
  const raw = readField(data, config.field);
  const value = typeof raw === 'number' && Number.isFinite(raw) ? raw : null;
  const span = config.max - config.min || 1;
  const fraction = value === null ? 0 : Math.min(1, Math.max(0, (value - config.min) / span));

  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', padding: 12 }}>
      <svg viewBox="0 0 200 150" style={{ width: '100%', height: '100%' }} role="img">
        <title>{`${config.topic} ${config.field}: ${value ?? 'no data'}`}</title>
        <path
          d={ARC}
          pathLength={100}
          fill="none"
          stroke="var(--miti-border-strong)"
          strokeWidth={12}
          strokeLinecap="round"
        />
        {value !== null && (
          <path
            d={ARC}
            pathLength={100}
            fill="none"
            stroke="var(--miti-accent)"
            strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray={`${fraction * 100} 100`}
          />
        )}
        <text x={100} y={100} fill="var(--miti-text-strong)" fontSize={28} textAnchor="middle">
          {value === null ? '—' : format(value)}
        </text>
        <text x={100} y={120} {...label}>
          {config.unit}
        </text>
        <text x={35} y={148} {...label}>
          {config.min}
        </text>
        <text x={165} y={148} {...label}>
          {config.max}
        </text>
      </svg>
      <PanelStatus>
        <span>{data ? config.field : client ? 'Waiting for data' : 'Not connected'}</span>
      </PanelStatus>
      <PanelSettings>
        <TreeSection title="Gauge" keywords="topic field min max unit range">
          <TreeField label="Topic">
            <TopicInput
              aria-label="Topic"
              value={config.topic}
              topics={topics}
              onCommit={(topic) => updateConfig({ topic })}
            />
          </TreeField>
          <TextField
            label="Field"
            value={config.field}
            placeholder="position[0]"
            onCommit={(field) => updateConfig({ field })}
          />
          <NumberField
            label="Min"
            value={config.min}
            step={0.1}
            onCommit={(min) => updateConfig({ min })}
          />
          <NumberField
            label="Max"
            value={config.max}
            step={0.1}
            onCommit={(max) => updateConfig({ max })}
          />
          <TextField label="Unit" value={config.unit} onCommit={(unit) => updateConfig({ unit })} />
        </TreeSection>
      </PanelSettings>
    </div>
  );
}

export default defineWidget({
  panels: [
    definePanel<GaugeConfig>({
      type: 'example.gauge/gauge',
      label: 'Gauge',
      description: 'A number from any topic, as a dial',
      icon: GaugeIcon,
      defaultConfig: () => ({ ...DEFAULTS }),
      normalizeConfig: (stored) => ({ ...DEFAULTS, ...(stored as Partial<GaugeConfig>) }),
      component: Gauge,
    }),
  ],
});
