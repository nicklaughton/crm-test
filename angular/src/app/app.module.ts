import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { PackageService } from './shared/services/package.service';
import { ChangeLogService } from './shared/services/change-log.service';
import { TranslateService } from './shared/services/translate.service';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ApexDesignerCustomElementsService } from './shared/services/apex-designer-custom-elements.service';
import { ApexDesignerUserInterfacesService } from './shared/services/apex-designer-user-interfaces.service';
import { ApexDesignerBusinessObjectsService } from './shared/services/apex-designer-business-objects.service';
import { InitializeService } from './shared/services/initialize.service';
import { AppInitService } from './shared/services/app-init.service';
import { ApexDynamicElementDirective } from './shared/directives/apex-dynamic-element.directive';
import { ApexShowMoreButtonComponent } from './user-interfaces/apex-show-more-button/apex-show-more-button.component';
import { AvatarComponent } from './user-interfaces/avatar/avatar.component';

import { UnloadConfirmationDialogComponent } from './user-interfaces/unload-confirmation-dialog/unload-confirmation-dialog.component';

import { ApexDeleteButtonComponent } from './user-interfaces/apex-delete-button/apex-delete-button.component';

import { AppComponent } from './app.component';

import { ApexNgContentComponent } from './user-interfaces/apex-ng-content/apex-ng-content.component';

import { SummaryCardsComponent } from './user-interfaces/summary-cards/summary-cards.component';

import { ImageSectionComponent } from './user-interfaces/image-section/image-section.component';

import { ToolbarButtonsComponent } from './user-interfaces/toolbar-buttons/toolbar-buttons.component';

import { ApexCRMAddButtonComponent } from './user-interfaces/apex-crm-add-button/apex-crm-add-button.component';

import { ApexAuthAccessDialogComponent } from './user-interfaces/apex-auth-access-dialog/apex-auth-access-dialog.component';

import { ApexAuthAccessDialogWrapperComponent } from './user-interfaces/apex-auth-access-dialog/apex-auth-access-dialog-wrapper.component';

import { ApexNavListComponent } from './user-interfaces/apex-nav-list/apex-nav-list.component';

import { ApexAddButtonComponent } from './user-interfaces/apex-add-button/apex-add-button.component';

import { ApexWrapDeprecatedComponent } from './user-interfaces/apex-wrap-deprecated/apex-wrap-deprecated.component';

import { ApexAddDialogComponent } from './user-interfaces/apex-add-dialog/apex-add-dialog.component';

import { ApexAddDialogWrapperComponent } from './user-interfaces/apex-add-dialog/apex-add-dialog-wrapper.component';

import { ApexTextFieldComponent } from './user-interfaces/apex-text-field/apex-text-field.component';

import { ApexFieldsComponent } from './user-interfaces/apex-fields/apex-fields.component';

import { ApexNumberFieldComponent } from './user-interfaces/apex-number-field/apex-number-field.component';

import { ApexMultilineFieldComponent } from './user-interfaces/apex-multiline-field/apex-multiline-field.component';

import { ApexTableDepComponent } from './user-interfaces/apex-table-dep/apex-table-dep.component';

import { ApexRowComponent } from './user-interfaces/apex-row/apex-row.component';

import { ApexSearchBarComponent } from './user-interfaces/apex-search-bar/apex-search-bar.component';

import { ApexColumnsChooserComponent } from './user-interfaces/apex-columns-chooser/apex-columns-chooser.component';

import { ApexColumnsChooserDialogComponent } from './user-interfaces/apex-columns-chooser-dialog/apex-columns-chooser-dialog.component';

import { ApexColumnsChooserDialogWrapperComponent } from './user-interfaces/apex-columns-chooser-dialog/apex-columns-chooser-dialog-wrapper.component';

import { ApexColumnComponent } from './user-interfaces/apex-column/apex-column.component';

import { ApexAddFieldComponent } from './user-interfaces/apex-add-field/apex-add-field.component';

import { ApexBreadcrumbComponent } from './user-interfaces/apex-breadcrumb/apex-breadcrumb.component';

import { ApexSectionComponent } from './user-interfaces/apex-section/apex-section.component';

import { ApexBooleanFieldComponent } from './user-interfaces/apex-boolean-field/apex-boolean-field.component';

import { ApexDisplayNameComponent } from './user-interfaces/apex-display-name/apex-display-name.component';

import { ApexActionListComponent } from './user-interfaces/apex-action-list/apex-action-list.component';

import { ApexAccordionComponent } from './user-interfaces/apex-accordion/apex-accordion.component';

import { ApexObjectAutocompleteFieldComponent } from './user-interfaces/apex-object-autocomplete-field/apex-object-autocomplete-field.component';

import { ApexSelectFieldComponent } from './user-interfaces/apex-select-field/apex-select-field.component';

import { ApexAutocompleteFieldComponent } from './user-interfaces/apex-autocomplete-field/apex-autocomplete-field.component';

import { ApexRefreshButtonComponent } from './user-interfaces/apex-refresh-button/apex-refresh-button.component';

import { ApexExportButtonComponent } from './user-interfaces/apex-export-button/apex-export-button.component';

import { ApexImportButtonComponent } from './user-interfaces/apex-import-button/apex-import-button.component';

import { ApexMessageDialogComponent } from './user-interfaces/apex-message-dialog/apex-message-dialog.component';

import { ApexMessageDialogWrapperComponent } from './user-interfaces/apex-message-dialog/apex-message-dialog-wrapper.component';

import { ApexAdvancedFilterComponent } from './user-interfaces/apex-advanced-filter/apex-advanced-filter.component';

import { ApexExportManyButtonComponent } from './user-interfaces/apex-export-many-button/apex-export-many-button.component';

import { ApexDateFieldComponent } from './user-interfaces/apex-date-field/apex-date-field.component';

import { DateRangeFieldComponent } from './user-interfaces/date-range-field/date-range-field.component';

import { ApexDateTimeFieldV1Component } from './user-interfaces/apex-date-time-field-v1/apex-date-time-field-v1.component';

import { ApexExportTsvButtonComponent } from './user-interfaces/apex-export-tsv-button/apex-export-tsv-button.component';

import { ApexImportTsvDialogComponent } from './user-interfaces/apex-import-tsv-dialog/apex-import-tsv-dialog.component';

import { ApexImportTsvDialogWrapperComponent } from './user-interfaces/apex-import-tsv-dialog/apex-import-tsv-dialog-wrapper.component';

import { ApexImportTsvButtonComponent } from './user-interfaces/apex-import-tsv-button/apex-import-tsv-button.component';

import { ApexBelongsToFieldComponent } from './user-interfaces/apex-belongs-to-field/apex-belongs-to-field.component';

import { ApexTableComponent } from './user-interfaces/apex-table/apex-table.component';

import { ApexSelectObjectFieldComponent } from './user-interfaces/apex-select-object-field/apex-select-object-field.component';

import { ApexIntegerFieldComponent } from './user-interfaces/apex-integer-field/apex-integer-field.component';

import { ApexFieldComponent } from './user-interfaces/apex-field/apex-field.component';

import { ApexEditDialogComponent } from './user-interfaces/apex-edit-dialog/apex-edit-dialog.component';

import { ApexEditDialogWrapperComponent } from './user-interfaces/apex-edit-dialog/apex-edit-dialog-wrapper.component';

import { ApexEditButtonComponent } from './user-interfaces/apex-edit-button/apex-edit-button.component';

import { ApexStateFieldComponent } from './user-interfaces/apex-state-field/apex-state-field.component';

import { CountryFieldComponent } from './user-interfaces/country-field/country-field.component';

import { ApexWrapComponent } from './user-interfaces/apex-wrap/apex-wrap.component';

import { ApexCurrencyFieldComponent } from './user-interfaces/apex-currency-field/apex-currency-field.component';

import { ApexDateTimeFieldComponent } from './user-interfaces/apex-date-time-field/apex-date-time-field.component';

import { ApexDateWithFixedTimezoneFieldComponent } from './user-interfaces/apex-date-with-fixed-timezone-field/apex-date-with-fixed-timezone-field.component';

import { ApexPathBreadcrumbComponent } from './user-interfaces/apex-path-breadcrumb/apex-path-breadcrumb.component';

import { ApexNavListV2Component } from './user-interfaces/apex-nav-list-v2/apex-nav-list-v2.component';

import { ApexFieldsV2Component } from './user-interfaces/apex-fields-v2/apex-fields-v2.component';

import { ApexTableV3Component } from './user-interfaces/apex-table-v3/apex-table-v3.component';

import { DocsInContextDialogComponent } from './user-interfaces/docs-in-context-dialog/docs-in-context-dialog.component';

import { DocsInContextDialogWrapperComponent } from './user-interfaces/docs-in-context-dialog/docs-in-context-dialog-wrapper.component';

import { DocsInContextButtonComponent } from './user-interfaces/docs-in-context-button/docs-in-context-button.component';

import { ApexLoadingContainerComponent } from './user-interfaces/apex-loading-container/apex-loading-container.component';

import { ErrorDialogComponent } from './user-interfaces/error-dialog/error-dialog.component';

import { ErrorDialogWrapperComponent } from './user-interfaces/error-dialog/error-dialog-wrapper.component';

import { ErrorAlertComponent } from './user-interfaces/error-alert/error-alert.component';

import { ApexRadioButtonsFieldComponent } from './user-interfaces/apex-radio-buttons-field/apex-radio-buttons-field.component';

import { VerifyEmailComponent } from './user-interfaces/verify-email/verify-email.component';

import { LoginErrorComponent } from './user-interfaces/login-error/login-error.component';

import { LogInComponent } from './user-interfaces/log-in/log-in.component';

import { ContactsComponent } from './user-interfaces/contacts/contacts.component';

import { ApexObjectsPageContentComponent } from './user-interfaces/apex-objects-page-content/apex-objects-page-content.component';

import { ProjectComponent } from './user-interfaces/project/project.component';

import { CompanyComponent } from './user-interfaces/company/company.component';

import { ApexObjectPageContentComponent } from './user-interfaces/apex-object-page-content/apex-object-page-content.component';

import { ContactComponent } from './user-interfaces/contact/contact.component';

import { LogoutComponent } from './user-interfaces/logout/logout.component';

import { HomeComponent } from './user-interfaces/home/home.component';

import { ApexDynamicObjectPageComponent } from './user-interfaces/apex-dynamic-object-page/apex-dynamic-object-page.component';

import { MetaTagService } from './shared/services/meta-tag.service';

import { ApexComponentHostDirective } from './shared/directives/apex-component-host.directive';
import { PathToRootObjectService } from './shared/services/path-to-root-object.service';
import { ApexCurrencyPipe } from './shared/pipes/apex-currency-pipe';
import { ApexWidthDirective } from './shared/directives/apex-width.directive';
import { ApexDynamicComponentsService } from './shared/services/apex-dynamic-components.service';
import { SafeUrlPipe } from './shared/pipes/safe-url.pipe';
import { ApexDesignerAssetService } from './shared/services/apex-designer-asset.service';
import { BaseHrefInterceptor } from './shared/services/base-href.interceptor';
import { ApexDesignerEditService } from './shared/services/apex-designer-edit.service';
import { AuthGuard } from './shared/services/auth.guard';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { NgxMatDatetimePickerModule } from '@angular-material-components/datetime-picker';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import { NgxMaskModule } from 'ngx-mask';
import { NgxCurrencyModule } from 'ngx-currency';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTreeModule } from '@angular/material/tree';
import { MatDialogModule } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSliderModule } from '@angular/material/slider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDividerModule } from '@angular/material/divider';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DatePipe } from '@angular/common';
import { ConfirmationDialogModule } from './user-interfaces/confirmation-dialog/confirmation-dialog.module';
import { ApiInterceptorModule } from './shared/services/base-href.module';
import { Auth0HttpInterceptorModule } from './shared/services/auth0-http-interceptor.module';

const appRoutes: Routes = [
    { path: 'verifyEmail', component: VerifyEmailComponent, pathMatch: 'full' },
    { path: 'loginError', component: LoginErrorComponent, pathMatch: 'full' },
    { path: 'logIn', component: LogInComponent, pathMatch: 'full' },
    {
        path: 'contacts',
        component: ContactsComponent,
        canActivate: [AuthGuard],
        pathMatch: 'full',
    },
    {
        path: 'home/projects/:project.id',
        component: ProjectComponent,
        canActivate: [AuthGuard],
        pathMatch: 'full',
    },
    {
        path: 'companies/:company.id',
        component: CompanyComponent,
        canActivate: [AuthGuard],
        pathMatch: 'full',
    },
    {
        path: 'contacts/:contact.id',
        component: ContactComponent,
        canActivate: [AuthGuard],
        pathMatch: 'full',
    },
    { path: 'logout', component: LogoutComponent, pathMatch: 'full' },
    { path: '', redirectTo: 'home', pathMatch: 'full' },

    {
        path: 'home',
        component: HomeComponent,
        canActivate: [AuthGuard],
        pathMatch: 'full',
    },
    {
        path: '**',
        children: [{ path: '**', component: ApexDynamicObjectPageComponent }],
        canActivate: [AuthGuard],
    },
];

@NgModule({
    providers: [
        PackageService,
        ChangeLogService,
        TranslateService,
        ApexDesignerCustomElementsService,
        ApexDesignerUserInterfacesService,
        ApexDesignerBusinessObjectsService,
        {
            provide: APP_INITIALIZER,
            useFactory: initializeProviderFactory,
            multi: true,
            deps: [InitializeService],
        },
        {
            provide: APP_INITIALIZER,
            useFactory: appInitProviderFactory,
            multi: true,
            deps: [AppInitService],
        },
        PathToRootObjectService,
        ApexCurrencyPipe,
        ApexDynamicComponentsService,
        SafeUrlPipe,
        ApexDesignerAssetService,
        BaseHrefInterceptor,
        ApexDesignerEditService,
        AuthGuard,
    ],
    entryComponents: [
        ApexShowMoreButtonComponent,
        AvatarComponent,
        UnloadConfirmationDialogComponent,
        ApexDeleteButtonComponent,
        AppComponent,
        ApexNgContentComponent,
        SummaryCardsComponent,
        ImageSectionComponent,
        ToolbarButtonsComponent,
        ApexCRMAddButtonComponent,
        ApexAuthAccessDialogComponent,
        ApexNavListComponent,
        ApexAddButtonComponent,
        ApexWrapDeprecatedComponent,
        ApexAddDialogComponent,
        ApexTextFieldComponent,
        ApexFieldsComponent,
        ApexNumberFieldComponent,
        ApexMultilineFieldComponent,
        ApexTableDepComponent,
        ApexRowComponent,
        ApexSearchBarComponent,
        ApexColumnsChooserComponent,
        ApexColumnsChooserDialogComponent,
        ApexColumnComponent,
        ApexAddFieldComponent,
        ApexBreadcrumbComponent,
        ApexSectionComponent,
        ApexBooleanFieldComponent,
        ApexDisplayNameComponent,
        ApexActionListComponent,
        ApexAccordionComponent,
        ApexObjectAutocompleteFieldComponent,
        ApexSelectFieldComponent,
        ApexAutocompleteFieldComponent,
        ApexRefreshButtonComponent,
        ApexExportButtonComponent,
        ApexImportButtonComponent,
        ApexMessageDialogComponent,
        ApexAdvancedFilterComponent,
        ApexExportManyButtonComponent,
        ApexDateFieldComponent,
        DateRangeFieldComponent,
        ApexDateTimeFieldV1Component,
        ApexExportTsvButtonComponent,
        ApexImportTsvDialogComponent,
        ApexImportTsvButtonComponent,
        ApexBelongsToFieldComponent,
        ApexTableComponent,
        ApexSelectObjectFieldComponent,
        ApexIntegerFieldComponent,
        ApexFieldComponent,
        ApexEditDialogComponent,
        ApexEditButtonComponent,
        ApexStateFieldComponent,
        CountryFieldComponent,
        ApexWrapComponent,
        ApexCurrencyFieldComponent,
        ApexDateTimeFieldComponent,
        ApexDateWithFixedTimezoneFieldComponent,
        ApexPathBreadcrumbComponent,
        ApexNavListV2Component,
        ApexFieldsV2Component,
        ApexTableV3Component,
        DocsInContextDialogComponent,
        DocsInContextButtonComponent,
        ApexLoadingContainerComponent,
        ErrorDialogComponent,
        ErrorAlertComponent,
        ApexRadioButtonsFieldComponent,
        ApexObjectsPageContentComponent,
        ApexObjectPageContentComponent,
    ],
    declarations: [
        AppComponent,
        ApexComponentHostDirective,
        ApexDynamicElementDirective,
        ApexCurrencyPipe,
        ApexWidthDirective,
        SafeUrlPipe,
        ApexShowMoreButtonComponent,
        AvatarComponent,
        UnloadConfirmationDialogComponent,
        ApexDeleteButtonComponent,
        ApexNgContentComponent,
        SummaryCardsComponent,
        ImageSectionComponent,
        ToolbarButtonsComponent,
        ApexCRMAddButtonComponent,
        ApexAuthAccessDialogComponent,
        ApexAuthAccessDialogWrapperComponent,
        ApexNavListComponent,
        ApexAddButtonComponent,
        ApexWrapDeprecatedComponent,
        ApexAddDialogComponent,
        ApexAddDialogWrapperComponent,
        ApexTextFieldComponent,
        ApexFieldsComponent,
        ApexNumberFieldComponent,
        ApexMultilineFieldComponent,
        ApexTableDepComponent,
        ApexRowComponent,
        ApexSearchBarComponent,
        ApexColumnsChooserComponent,
        ApexColumnsChooserDialogComponent,
        ApexColumnsChooserDialogWrapperComponent,
        ApexColumnComponent,
        ApexAddFieldComponent,
        ApexBreadcrumbComponent,
        ApexSectionComponent,
        ApexBooleanFieldComponent,
        ApexDisplayNameComponent,
        ApexActionListComponent,
        ApexAccordionComponent,
        ApexObjectAutocompleteFieldComponent,
        ApexSelectFieldComponent,
        ApexAutocompleteFieldComponent,
        ApexRefreshButtonComponent,
        ApexExportButtonComponent,
        ApexImportButtonComponent,
        ApexMessageDialogComponent,
        ApexMessageDialogWrapperComponent,
        ApexAdvancedFilterComponent,
        ApexExportManyButtonComponent,
        ApexDateFieldComponent,
        DateRangeFieldComponent,
        ApexDateTimeFieldV1Component,
        ApexExportTsvButtonComponent,
        ApexImportTsvDialogComponent,
        ApexImportTsvDialogWrapperComponent,
        ApexImportTsvButtonComponent,
        ApexBelongsToFieldComponent,
        ApexTableComponent,
        ApexSelectObjectFieldComponent,
        ApexIntegerFieldComponent,
        ApexFieldComponent,
        ApexEditDialogComponent,
        ApexEditDialogWrapperComponent,
        ApexEditButtonComponent,
        ApexStateFieldComponent,
        CountryFieldComponent,
        ApexWrapComponent,
        ApexCurrencyFieldComponent,
        ApexDateTimeFieldComponent,
        ApexDateWithFixedTimezoneFieldComponent,
        ApexPathBreadcrumbComponent,
        ApexNavListV2Component,
        ApexFieldsV2Component,
        ApexTableV3Component,
        DocsInContextDialogComponent,
        DocsInContextDialogWrapperComponent,
        DocsInContextButtonComponent,
        ApexLoadingContainerComponent,
        ErrorDialogComponent,
        ErrorDialogWrapperComponent,
        ErrorAlertComponent,
        ApexRadioButtonsFieldComponent,
        VerifyEmailComponent,
        LoginErrorComponent,
        LogInComponent,
        ContactsComponent,
        ApexObjectsPageContentComponent,
        ProjectComponent,
        CompanyComponent,
        ApexObjectPageContentComponent,
        ContactComponent,
        LogoutComponent,
        HomeComponent,
        ApexDynamicObjectPageComponent,
    ],
    imports: [
        BrowserModule.withServerTransition({ appId: 'universal' }),
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        RouterModule.forRoot(appRoutes),
        MatMomentDateModule,
        NgxMatDatetimePickerModule,
        NgxMatMomentModule,
        NgxMaskModule.forRoot(),
        NgxCurrencyModule,
        DragDropModule,
        ScrollingModule,
        BrowserAnimationsModule,
        MatGridListModule,
        MatSidenavModule,
        MatTabsModule,
        MatTreeModule,
        MatDialogModule,
        MatBadgeModule,
        MatSliderModule,
        MatAutocompleteModule,
        MatToolbarModule,
        MatCheckboxModule,
        MatInputModule,
        MatListModule,
        MatProgressSpinnerModule,
        MatCardModule,
        MatMenuModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatRadioModule,
        MatButtonModule,
        MatSortModule,
        MatButtonToggleModule,
        MatChipsModule,
        MatTooltipModule,
        MatPaginatorModule,
        MatIconModule,
        MatExpansionModule,
        MatTableModule,
        MatProgressBarModule,
        MatSnackBarModule,
        MatDatepickerModule,
        MatStepperModule,
        MatDividerModule,
        FlexLayoutModule,
        DatePipe,
        ConfirmationDialogModule,
        ApiInterceptorModule,
        Auth0HttpInterceptorModule,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}

// @dynamic
export function initializeProviderFactory(initService: InitializeService) {
    const res = () => initService.init();
    return res;
}

export function appInitProviderFactory(appInitService: AppInitService) {
    const res = () => appInitService.init();
    return res;
}
