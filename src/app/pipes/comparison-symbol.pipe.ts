import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'comparisonSymbol',
  standalone: true,
})
export class ComparisonSymbolPipe implements PipeTransform {
  transform(result: string | null | undefined): string {
    if (!result) {
      return '—';
    }

    // Return the full result string (no longer extract just the symbol)
    return result;
  }
}
