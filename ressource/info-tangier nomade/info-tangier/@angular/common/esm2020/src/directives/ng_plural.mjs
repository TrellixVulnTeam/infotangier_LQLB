/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Attribute, Directive, Host, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { getPluralCategory, NgLocalization } from '../i18n/localization';
import { SwitchView } from './ng_switch';
import * as i0 from "@angular/core";
import * as i1 from "../i18n/localization";
/**
 * @ngModule CommonModule
 *
 * @usageNotes
 * ```
 * <some-element [ngPlural]="value">
 *   <ng-template ngPluralCase="=0">there is nothing</ng-template>
 *   <ng-template ngPluralCase="=1">there is one</ng-template>
 *   <ng-template ngPluralCase="few">there are a few</ng-template>
 * </some-element>
 * ```
 *
 * @description
 *
 * Adds / removes DOM sub-trees based on a numeric value. Tailored for pluralization.
 *
 * Displays DOM sub-trees that match the switch expression value, or failing that, DOM sub-trees
 * that match the switch expression's pluralization category.
 *
 * To use this directive you must provide a container element that sets the `[ngPlural]` attribute
 * to a switch expression. Inner elements with a `[ngPluralCase]` will display based on their
 * expression:
 * - if `[ngPluralCase]` is set to a value starting with `=`, it will only display if the value
 *   matches the switch expression exactly,
 * - otherwise, the view will be treated as a "category match", and will only display if exact
 *   value matches aren't found and the value maps to its category for the defined locale.
 *
 * See http://cldr.unicode.org/index/cldr-spec/plural-rules
 *
 * @publicApi
 */
export class NgPlural {
    constructor(_localization) {
        this._localization = _localization;
        this._caseViews = {};
    }
    set ngPlural(value) {
        this._switchValue = value;
        this._updateView();
    }
    addCase(value, switchView) {
        this._caseViews[value] = switchView;
    }
    _updateView() {
        this._clearViews();
        const cases = Object.keys(this._caseViews);
        const key = getPluralCategory(this._switchValue, cases, this._localization);
        this._activateView(this._caseViews[key]);
    }
    _clearViews() {
        if (this._activeView)
            this._activeView.destroy();
    }
    _activateView(view) {
        if (view) {
            this._activeView = view;
            this._activeView.create();
        }
    }
}
NgPlural.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.10", ngImport: i0, type: NgPlural, deps: [{ token: i1.NgLocalization }], target: i0.ɵɵFactoryTarget.Directive });
NgPlural.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.3.10", type: NgPlural, selector: "[ngPlural]", inputs: { ngPlural: "ngPlural" }, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.10", ngImport: i0, type: NgPlural, decorators: [{
            type: Directive,
            args: [{ selector: '[ngPlural]' }]
        }], ctorParameters: function () { return [{ type: i1.NgLocalization }]; }, propDecorators: { ngPlural: [{
                type: Input
            }] } });
/**
 * @ngModule CommonModule
 *
 * @description
 *
 * Creates a view that will be added/removed from the parent {@link NgPlural} when the
 * given expression matches the plural expression according to CLDR rules.
 *
 * @usageNotes
 * ```
 * <some-element [ngPlural]="value">
 *   <ng-template ngPluralCase="=0">...</ng-template>
 *   <ng-template ngPluralCase="other">...</ng-template>
 * </some-element>
 *```
 *
 * See {@link NgPlural} for more details and example.
 *
 * @publicApi
 */
export class NgPluralCase {
    constructor(value, template, viewContainer, ngPlural) {
        this.value = value;
        const isANumber = !isNaN(Number(value));
        ngPlural.addCase(isANumber ? `=${value}` : value, new SwitchView(viewContainer, template));
    }
}
NgPluralCase.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "13.3.10", ngImport: i0, type: NgPluralCase, deps: [{ token: 'ngPluralCase', attribute: true }, { token: i0.TemplateRef }, { token: i0.ViewContainerRef }, { token: NgPlural, host: true }], target: i0.ɵɵFactoryTarget.Directive });
NgPluralCase.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "12.0.0", version: "13.3.10", type: NgPluralCase, selector: "[ngPluralCase]", ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "13.3.10", ngImport: i0, type: NgPluralCase, decorators: [{
            type: Directive,
            args: [{ selector: '[ngPluralCase]' }]
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Attribute,
                    args: ['ngPluralCase']
                }] }, { type: i0.TemplateRef }, { type: i0.ViewContainerRef }, { type: NgPlural, decorators: [{
                    type: Host
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfcGx1cmFsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX3BsdXJhbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsU0FBUyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUUvRixPQUFPLEVBQUMsaUJBQWlCLEVBQUUsY0FBYyxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFFdkUsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLGFBQWEsQ0FBQzs7O0FBR3ZDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E4Qkc7QUFFSCxNQUFNLE9BQU8sUUFBUTtJQU9uQixZQUFvQixhQUE2QjtRQUE3QixrQkFBYSxHQUFiLGFBQWEsQ0FBZ0I7UUFGekMsZUFBVSxHQUE4QixFQUFFLENBQUM7SUFFQyxDQUFDO0lBRXJELElBQ0ksUUFBUSxDQUFDLEtBQWE7UUFDeEIsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7UUFDMUIsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3JCLENBQUM7SUFFRCxPQUFPLENBQUMsS0FBYSxFQUFFLFVBQXNCO1FBQzNDLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsVUFBVSxDQUFDO0lBQ3RDLENBQUM7SUFFTyxXQUFXO1FBQ2pCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUVuQixNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMzQyxNQUFNLEdBQUcsR0FBRyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDNUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVPLFdBQVc7UUFDakIsSUFBSSxJQUFJLENBQUMsV0FBVztZQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDbkQsQ0FBQztJQUVPLGFBQWEsQ0FBQyxJQUFnQjtRQUNwQyxJQUFJLElBQUksRUFBRTtZQUNSLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDM0I7SUFDSCxDQUFDOztnSEFwQ1UsUUFBUTtvR0FBUixRQUFRO3NHQUFSLFFBQVE7a0JBRHBCLFNBQVM7bUJBQUMsRUFBQyxRQUFRLEVBQUUsWUFBWSxFQUFDO3FHQVc3QixRQUFRO3NCQURYLEtBQUs7O0FBOEJSOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbUJHO0FBRUgsTUFBTSxPQUFPLFlBQVk7SUFDdkIsWUFDc0MsS0FBYSxFQUFFLFFBQTZCLEVBQzlFLGFBQStCLEVBQVUsUUFBa0I7UUFEekIsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUVqRCxNQUFNLFNBQVMsR0FBWSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUNqRCxRQUFRLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLElBQUksVUFBVSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQzdGLENBQUM7O29IQU5VLFlBQVksa0JBRVIsY0FBYyx5RkFDMEIsUUFBUTt3R0FIcEQsWUFBWTtzR0FBWixZQUFZO2tCQUR4QixTQUFTO21CQUFDLEVBQUMsUUFBUSxFQUFFLGdCQUFnQixFQUFDOzswQkFHaEMsU0FBUzsyQkFBQyxjQUFjO3VGQUMwQixRQUFROzBCQUF6QixJQUFJIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7QXR0cmlidXRlLCBEaXJlY3RpdmUsIEhvc3QsIElucHV0LCBUZW1wbGF0ZVJlZiwgVmlld0NvbnRhaW5lclJlZn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7Z2V0UGx1cmFsQ2F0ZWdvcnksIE5nTG9jYWxpemF0aW9ufSBmcm9tICcuLi9pMThuL2xvY2FsaXphdGlvbic7XG5cbmltcG9ydCB7U3dpdGNoVmlld30gZnJvbSAnLi9uZ19zd2l0Y2gnO1xuXG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBgYGBcbiAqIDxzb21lLWVsZW1lbnQgW25nUGx1cmFsXT1cInZhbHVlXCI+XG4gKiAgIDxuZy10ZW1wbGF0ZSBuZ1BsdXJhbENhc2U9XCI9MFwiPnRoZXJlIGlzIG5vdGhpbmc8L25nLXRlbXBsYXRlPlxuICogICA8bmctdGVtcGxhdGUgbmdQbHVyYWxDYXNlPVwiPTFcIj50aGVyZSBpcyBvbmU8L25nLXRlbXBsYXRlPlxuICogICA8bmctdGVtcGxhdGUgbmdQbHVyYWxDYXNlPVwiZmV3XCI+dGhlcmUgYXJlIGEgZmV3PC9uZy10ZW1wbGF0ZT5cbiAqIDwvc29tZS1lbGVtZW50PlxuICogYGBgXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQWRkcyAvIHJlbW92ZXMgRE9NIHN1Yi10cmVlcyBiYXNlZCBvbiBhIG51bWVyaWMgdmFsdWUuIFRhaWxvcmVkIGZvciBwbHVyYWxpemF0aW9uLlxuICpcbiAqIERpc3BsYXlzIERPTSBzdWItdHJlZXMgdGhhdCBtYXRjaCB0aGUgc3dpdGNoIGV4cHJlc3Npb24gdmFsdWUsIG9yIGZhaWxpbmcgdGhhdCwgRE9NIHN1Yi10cmVlc1xuICogdGhhdCBtYXRjaCB0aGUgc3dpdGNoIGV4cHJlc3Npb24ncyBwbHVyYWxpemF0aW9uIGNhdGVnb3J5LlxuICpcbiAqIFRvIHVzZSB0aGlzIGRpcmVjdGl2ZSB5b3UgbXVzdCBwcm92aWRlIGEgY29udGFpbmVyIGVsZW1lbnQgdGhhdCBzZXRzIHRoZSBgW25nUGx1cmFsXWAgYXR0cmlidXRlXG4gKiB0byBhIHN3aXRjaCBleHByZXNzaW9uLiBJbm5lciBlbGVtZW50cyB3aXRoIGEgYFtuZ1BsdXJhbENhc2VdYCB3aWxsIGRpc3BsYXkgYmFzZWQgb24gdGhlaXJcbiAqIGV4cHJlc3Npb246XG4gKiAtIGlmIGBbbmdQbHVyYWxDYXNlXWAgaXMgc2V0IHRvIGEgdmFsdWUgc3RhcnRpbmcgd2l0aCBgPWAsIGl0IHdpbGwgb25seSBkaXNwbGF5IGlmIHRoZSB2YWx1ZVxuICogICBtYXRjaGVzIHRoZSBzd2l0Y2ggZXhwcmVzc2lvbiBleGFjdGx5LFxuICogLSBvdGhlcndpc2UsIHRoZSB2aWV3IHdpbGwgYmUgdHJlYXRlZCBhcyBhIFwiY2F0ZWdvcnkgbWF0Y2hcIiwgYW5kIHdpbGwgb25seSBkaXNwbGF5IGlmIGV4YWN0XG4gKiAgIHZhbHVlIG1hdGNoZXMgYXJlbid0IGZvdW5kIGFuZCB0aGUgdmFsdWUgbWFwcyB0byBpdHMgY2F0ZWdvcnkgZm9yIHRoZSBkZWZpbmVkIGxvY2FsZS5cbiAqXG4gKiBTZWUgaHR0cDovL2NsZHIudW5pY29kZS5vcmcvaW5kZXgvY2xkci1zcGVjL3BsdXJhbC1ydWxlc1xuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdQbHVyYWxdJ30pXG5leHBvcnQgY2xhc3MgTmdQbHVyYWwge1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfc3dpdGNoVmFsdWUhOiBudW1iZXI7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF9hY3RpdmVWaWV3ITogU3dpdGNoVmlldztcbiAgcHJpdmF0ZSBfY2FzZVZpZXdzOiB7W2s6IHN0cmluZ106IFN3aXRjaFZpZXd9ID0ge307XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfbG9jYWxpemF0aW9uOiBOZ0xvY2FsaXphdGlvbikge31cblxuICBASW5wdXQoKVxuICBzZXQgbmdQbHVyYWwodmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMuX3N3aXRjaFZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5fdXBkYXRlVmlldygpO1xuICB9XG5cbiAgYWRkQ2FzZSh2YWx1ZTogc3RyaW5nLCBzd2l0Y2hWaWV3OiBTd2l0Y2hWaWV3KTogdm9pZCB7XG4gICAgdGhpcy5fY2FzZVZpZXdzW3ZhbHVlXSA9IHN3aXRjaFZpZXc7XG4gIH1cblxuICBwcml2YXRlIF91cGRhdGVWaWV3KCk6IHZvaWQge1xuICAgIHRoaXMuX2NsZWFyVmlld3MoKTtcblxuICAgIGNvbnN0IGNhc2VzID0gT2JqZWN0LmtleXModGhpcy5fY2FzZVZpZXdzKTtcbiAgICBjb25zdCBrZXkgPSBnZXRQbHVyYWxDYXRlZ29yeSh0aGlzLl9zd2l0Y2hWYWx1ZSwgY2FzZXMsIHRoaXMuX2xvY2FsaXphdGlvbik7XG4gICAgdGhpcy5fYWN0aXZhdGVWaWV3KHRoaXMuX2Nhc2VWaWV3c1trZXldKTtcbiAgfVxuXG4gIHByaXZhdGUgX2NsZWFyVmlld3MoKSB7XG4gICAgaWYgKHRoaXMuX2FjdGl2ZVZpZXcpIHRoaXMuX2FjdGl2ZVZpZXcuZGVzdHJveSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYWN0aXZhdGVWaWV3KHZpZXc6IFN3aXRjaFZpZXcpIHtcbiAgICBpZiAodmlldykge1xuICAgICAgdGhpcy5fYWN0aXZlVmlldyA9IHZpZXc7XG4gICAgICB0aGlzLl9hY3RpdmVWaWV3LmNyZWF0ZSgpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBDcmVhdGVzIGEgdmlldyB0aGF0IHdpbGwgYmUgYWRkZWQvcmVtb3ZlZCBmcm9tIHRoZSBwYXJlbnQge0BsaW5rIE5nUGx1cmFsfSB3aGVuIHRoZVxuICogZ2l2ZW4gZXhwcmVzc2lvbiBtYXRjaGVzIHRoZSBwbHVyYWwgZXhwcmVzc2lvbiBhY2NvcmRpbmcgdG8gQ0xEUiBydWxlcy5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogYGBgXG4gKiA8c29tZS1lbGVtZW50IFtuZ1BsdXJhbF09XCJ2YWx1ZVwiPlxuICogICA8bmctdGVtcGxhdGUgbmdQbHVyYWxDYXNlPVwiPTBcIj4uLi48L25nLXRlbXBsYXRlPlxuICogICA8bmctdGVtcGxhdGUgbmdQbHVyYWxDYXNlPVwib3RoZXJcIj4uLi48L25nLXRlbXBsYXRlPlxuICogPC9zb21lLWVsZW1lbnQ+XG4gKmBgYFxuICpcbiAqIFNlZSB7QGxpbmsgTmdQbHVyYWx9IGZvciBtb3JlIGRldGFpbHMgYW5kIGV4YW1wbGUuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ1BsdXJhbENhc2VdJ30pXG5leHBvcnQgY2xhc3MgTmdQbHVyYWxDYXNlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICBAQXR0cmlidXRlKCduZ1BsdXJhbENhc2UnKSBwdWJsaWMgdmFsdWU6IHN0cmluZywgdGVtcGxhdGU6IFRlbXBsYXRlUmVmPE9iamVjdD4sXG4gICAgICB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLCBASG9zdCgpIG5nUGx1cmFsOiBOZ1BsdXJhbCkge1xuICAgIGNvbnN0IGlzQU51bWJlcjogYm9vbGVhbiA9ICFpc05hTihOdW1iZXIodmFsdWUpKTtcbiAgICBuZ1BsdXJhbC5hZGRDYXNlKGlzQU51bWJlciA/IGA9JHt2YWx1ZX1gIDogdmFsdWUsIG5ldyBTd2l0Y2hWaWV3KHZpZXdDb250YWluZXIsIHRlbXBsYXRlKSk7XG4gIH1cbn1cbiJdfQ==