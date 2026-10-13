import { Injectable, Signal, signal } from '@angular/core';

export type ToastKind = 'success' | 'error' | 'info';

export interface IToast {
  id: number;
  kind: ToastKind;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _nextId: number = 1;
  private readonly _toasts = signal<IToast[]>([]);

  public readonly toasts: Signal<IToast[]> = this._toasts.asReadonly();

  public success(message: string): void {
    this.show('success', message, 4000);
  }

  public error(message: string): void {
    this.show('error', message, 7000);
  }

  public info(message: string): void {
    this.show('info', message, 4000);
  }

  public dismiss(id: number): void {
    this._toasts.update((list: IToast[]): IToast[] => list.filter((t: IToast) => t.id !== id));
  }

  private show(kind: ToastKind, message: string, durationMs: number): void {
    const id: number = this._nextId++;
    this._toasts.update((list: IToast[]): IToast[] => [...list, { id, kind, message }]);
    setTimeout((): void => this.dismiss(id), durationMs);
  }
}
