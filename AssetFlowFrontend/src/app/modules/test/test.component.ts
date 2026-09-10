import { Component } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { TreeSelect } from 'primeng/treeselect';
import { TreeTableModule } from 'primeng/treetable';

@Component({
  selector: 'app-test',
  imports: [    ButtonModule,
      ButtonGroupModule,
      TreeSelect,
      TreeTableModule],
  templateUrl: './test.component.html',
  standalone: true,
  styleUrl: './test.component.scss'
})
export class TestComponent {
 title = 'primeng-demo';

  nodes: any[];
  files!: TreeNode[];

  selectedNodes: any;

  constructor() {

    this.nodes = [
      {
        key: '0',
        label: 'Documents',
        data: 'Documents Folder',
        icon: 'pi pi-fw pi-inbox',
        children: [
          {
            key: '0-0',
            label: 'Work',
            data: 'Work Folder',
            icon: 'pi pi-fw pi-cog',
            children: [
              { key: '0-0-0', label: 'Expenses.doc', icon: 'pi pi-fw pi-file', data: 'Expenses Document' },
              { key: '0-0-1', label: 'Resume.doc', icon: 'pi pi-fw pi-file', data: 'Resume Document' }
            ]
          },
          {
            key: '0-1',
            label: 'Home',
            data: 'Home Folder',
            icon: 'pi pi-fw pi-home',
            children: [{ key: '0-1-0', label: 'Invoices.txt', icon: 'pi pi-fw pi-file', data: 'Invoices for this month' }]
          }
        ]
      },
      // You can add more root nodes here if needed
    ];




     this.files = [
      {
        data: {
          name: 'Applications',
          size: '100kb',
          type: 'Folder'
        },
        children: [
          {
            data: {
              name: 'Angular',
              size: '25kb',
              type: 'File'
            }
          },
          {
            data: {
              name: 'React',
              size: '30kb',
              type: 'File'
            }
          }
        ]
      },
      {
        data: {
          name: 'Documents',
          size: '500kb',
          type: 'Folder'
        },
        children: [
          {
            data: {
              name: 'Work',
              size: '300kb',
              type: 'Folder'
            },
            children: [
              {
                data: {
                  name: 'Project Alpha.docx',
                  size: '150kb',
                  type: 'Document'
                }
              },
              {
                data: {
                  name: 'Project Beta.docx',
                  size: '150kb',
                  type: 'Document'
                }
              }
            ]
          },
          {
            data: {
              name: 'Personal',
              size: '200kb',
              type: 'Folder'
            },
            children: [
              {
                data: {
                  name: 'Taxes.pdf',
                  size: '200kb',
                  type: 'PDF'
                }
              }
            ]
          }
        ]
      }
    ];
  }
}
