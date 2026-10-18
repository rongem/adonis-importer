import { Component, OnDestroy, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { createXML } from '../../lib/helpers/xml.function';
import { createXLFile, xlFileName } from '../../lib/helpers/xlsx.functions';
import { xlsxMimeType } from '../../lib/helpers/xlsx-writer.functions';
import { AdonisStoreService } from '../../lib/store/adonis-store.service';
import { ApplicationStateService } from '../../lib/store/application-state.service';

@Component({
  selector: 'app-export-files',
  imports: [],
  templateUrl: './export-files.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './export-files.scss'
})
export class ExportFiles implements OnInit, OnDestroy {
  protected readonly store = inject(AdonisStoreService);
  protected readonly appState = inject(ApplicationStateService);
  protected readonly sanitizer = inject(DomSanitizer);
  xmlText = '';
  fileUrl?: SafeResourceUrl;
  xlFileUrl?: SafeResourceUrl;
  xlFileName = '';
  private objectUrls: string[] = [];

  ngOnInit(): void {
    const selectedClass = this.store.selectedClass()!;
    this.xmlText = createXML(selectedClass, this.store.selectedProperties(), this.store.attributes()!);
    this.fileUrl = this.createFileUrl(new Blob([this.xmlText], { type: 'application/xml' }));

    const xlFile = createXLFile(selectedClass, this.store.selectedProperties(), this.store.attributes()!);
    this.xlFileUrl = this.createFileUrl(new Blob([xlFile], { type: xlsxMimeType }));
    this.xlFileName = xlFileName(selectedClass);
  }

  ngOnDestroy(): void {
    this.objectUrls.forEach(url => window.URL.revokeObjectURL(url));
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.xmlText);
  }

  private createFileUrl(blob: Blob) {
    const url = window.URL.createObjectURL(blob);
    this.objectUrls.push(url);
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
