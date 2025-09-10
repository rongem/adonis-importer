import { Component, OnInit, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AdonisClass } from '../../lib/models/adonis-rest/metadata/class.interface';
import { AttributeOrRelation } from '../../lib/models/adonis-rest/metadata/notebook-elements.interface';
import { createXML } from '../../lib/helpers/xml.function';
import { createXLFile } from '../../lib/helpers/xlsx.functions';
import { AdonisAttributeContainer } from '../../lib/models/adonis-rest/metadata/container/container-attribute.interface';

@Component({
  selector: 'app-export-files',
  imports: [],
  templateUrl: './export-files.html',
  styleUrl: './export-files.scss'
})
export class ExportFiles implements OnInit {
  readonly selectedClass = input.required<AdonisClass>();
  readonly selectedProperties = input.required<AttributeOrRelation[]>();
  readonly attibutes = input.required<AdonisAttributeContainer>();

  xmlText = '';
  fileUrl?: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.xmlText = createXML(this.selectedClass(), this.selectedProperties(), this.attibutes());
    createXLFile(this.selectedClass(), this.selectedProperties(), this.attibutes());
    const blob = new Blob([this.xmlText], { type: 'application/xml' });

    this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.xmlText);
  }
}
