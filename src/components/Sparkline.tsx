import { useMemo, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { accentHex, useScheme, type Accent } from '@/theme';

type SparklineProps = {
  data: number[];
  color: Accent;
  height?: number;
  accessibilityLabel?: string;
};

/** Smooth line through the points using Catmull-Rom → cubic Bézier segments. */
function buildPaths(data: number[], width: number, height: number, inset: number) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: inset + (1 - (v - min) / span) * (height - inset * 2),
  }));

  let line = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    line += ` C${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
  }
  const area = `${line} L${width},${height} L0,${height} Z`;
  return { line, area };
}

export function Sparkline({ data, color, height = 32, accessibilityLabel }: SparklineProps) {
  const scheme = useScheme();
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(Math.round(e.nativeEvent.layout.width));

  const paths = useMemo(
    () => (width > 0 && data.length > 1 ? buildPaths(data, width, height, 2) : null),
    [data, width, height],
  );
  const gradientId = `spark-${color}`;

  return (
    <View
      style={{ height }}
      onLayout={onLayout}
      accessible={!!accessibilityLabel}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}>
      {paths && (
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={accentHex(color, scheme)} stopOpacity={0.28} />
              <Stop offset="1" stopColor={accentHex(color, scheme)} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Path d={paths.area} fill={`url(#${gradientId})`} />
          <Path d={paths.line} fill="none" stroke={accentHex(color, scheme)} strokeWidth={2} strokeLinecap="round" />
        </Svg>
      )}
    </View>
  );
}
