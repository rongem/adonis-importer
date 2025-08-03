import { Component, OnInit, input } from '@angular/core';
import { AdonisClass } from '../lib/interfaces/adonis-class.interface';
import { AttributeOrRelation } from '../lib/interfaces/adonis-notebook-elements.interface';
import { createXML } from '../lib/helpers/xml.function';
import { createXLFile } from '../lib/helpers/xlsx.functions';

@Component({
  selector: 'app-export-files',
  imports: [],
  templateUrl: './export-files.html',
  styleUrl: './export-files.scss'
})
export class ExportFiles implements OnInit {
  readonly selectedClass = input.required<AdonisClass>();
  readonly selectedProperties = input.required<AttributeOrRelation[]>();

  xmlText = '';

  ngOnInit(): void {
    this.xmlText = createXML(this.selectedClass(), this.selectedProperties());
    createXLFile(this.selectedClass(), this.selectedProperties());
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }
}
