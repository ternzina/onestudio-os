export type PieArcDatum<T> = {
  data: T;
  index: number;
  startAngle: number;
  endAngle: number;
  padAngle: number;
  value: number;
};

type PieGenerator<T> = {
  (data: T[]): PieArcDatum<T>[];
  value(accessor: (datum: T) => number): PieGenerator<T>;
  sort(compare: null | ((a: T, b: T) => number)): PieGenerator<T>;
  padAngle(value: number): PieGenerator<T>;
};

export function pie<T>(): PieGenerator<T> {
  let valueAccessor = (datum: T) => Number(datum) || 0;
  let padAngle = 0;

  const generator = ((data: T[]) => {
    const values = data.map((datum) => Math.max(0, valueAccessor(datum)));
    const total = values.reduce((sum, value) => sum + value, 0);
    let angle = -Math.PI / 2;

    return data.map((datum, index) => {
      const nextAngle = total > 0 ? angle + (values[index] / total) * Math.PI * 2 : angle;
      const result: PieArcDatum<T> = {
        data: datum,
        index,
        startAngle: angle,
        endAngle: nextAngle,
        padAngle,
        value: values[index],
      };
      angle = nextAngle;
      return result;
    });
  }) as PieGenerator<T>;

  generator.value = (accessor) => {
    valueAccessor = accessor;
    return generator;
  };
  generator.sort = () => generator;
  generator.padAngle = (value) => {
    padAngle = Math.max(0, value);
    return generator;
  };

  return generator;
}

type ArcDatum = Pick<PieArcDatum<unknown>, "startAngle" | "endAngle" | "padAngle">;

type ArcGenerator<T extends ArcDatum> = {
  (datum: T): string | null;
  innerRadius(value: number): ArcGenerator<T>;
  outerRadius(value: number): ArcGenerator<T>;
  cornerRadius(value: number): ArcGenerator<T>;
};

function point(radius: number, angle: number) {
  return `${Math.sin(angle) * radius},${-Math.cos(angle) * radius}`;
}

export function arc<T extends ArcDatum>(): ArcGenerator<T> {
  let innerRadius = 0;
  let outerRadius = 1;

  const generator = ((datum: T) => {
    const pad = Math.min(Math.max(0, datum.padAngle / 2), (datum.endAngle - datum.startAngle) / 2);
    const start = datum.startAngle + pad;
    const end = datum.endAngle - pad;
    const sweep = end - start;
    if (sweep <= 0 || outerRadius <= 0) return null;

    const largeArc = sweep > Math.PI ? 1 : 0;
    const outerStart = point(outerRadius, start);
    const outerEnd = point(outerRadius, end);
    const innerStart = point(innerRadius, end);
    const innerEnd = point(innerRadius, start);

    if (innerRadius <= 0) {
      return `M${outerStart}A${outerRadius},${outerRadius} 0 ${largeArc},1 ${outerEnd}L0,0Z`;
    }

    return `M${outerStart}A${outerRadius},${outerRadius} 0 ${largeArc},1 ${outerEnd}L${innerStart}A${innerRadius},${innerRadius} 0 ${largeArc},0 ${innerEnd}Z`;
  }) as ArcGenerator<T>;

  generator.innerRadius = (value) => {
    innerRadius = Math.max(0, value);
    return generator;
  };
  generator.outerRadius = (value) => {
    outerRadius = Math.max(0, value);
    return generator;
  };
  generator.cornerRadius = () => generator;

  return generator;
}
