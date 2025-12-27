import { Component, OnInit, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { createXML } from '../../lib/helpers/xml.function';
import { createXLFile } from '../../lib/helpers/xlsx.functions';
import { AdonisStoreService } from '../../lib/store/adonis-store.service';
import { ApplicationStateService } from '../../lib/store/application-state.service';

@Component({
  selector: 'app-export-files',
  imports: [],
  templateUrl: './export-files.html',
  styleUrl: './export-files.scss'
})
export class ExportFiles implements OnInit {
  protected readonly store = inject(AdonisStoreService);
  protected readonly appState = inject(ApplicationStateService);
  protected readonly sanitizer = inject(DomSanitizer);
  xmlText = '';
  fileUrl?: SafeResourceUrl;

  constructor() {}

  ngOnInit(): void {
    this.xmlText = createXML(this.store.selectedClass()!, this.store.selectedProperties(), this.store.attributes()!);
    createXLFile(this.store.selectedClass()!, this.store.selectedProperties(), this.store.attributes()!);
    const blob = new Blob([this.xmlText], { type: 'application/xml' });

    this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.xmlText);
  }
}
