import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'unitFormat',
  standalone: true,
})
export class UnitFormatPipe implements PipeTransform {
  transform(value: number | null | undefined, unit: string = ''): string {
    if (value === null || value === undefined) {
      return '—';
    }

    const formatted = this.formatNumber(value);
    return `${formatted} ${unit}`.trim();
  }

  private formatNumber(value: number): string {
    if (Math.abs(value) === Infinity || isNaN(value)) {
      return 'Invalid';
    }

    // Round to 6 significant figures
    const sigFigs = 6;
    const rounded = Number(value.toPrecision(sigFigs));

    // Remove trailing zeros
    return parseFloat(rounded.toString()).toString();
  }
}
