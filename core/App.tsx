import { FormTab } from './Form';

export type AppType = 'community' | 'external' | 'custom';

export default class App {
  type: AppType;
  namespace: string;

  formHeaderButtons: Array<any> = [];
  customFormTabs: Array<FormTab> = [];

  constructor() {
  }

  init() {
    //
  }

  addFormHeaderButton(title: string, onClick: any)
  {
    this.formHeaderButtons.push({ title: title, onClick: onClick });
  }

  getFormHeaderButtons()
  {
    return this.formHeaderButtons;
  }

  addCustomFormTab(tab: FormTab)
  {
    tab.isCustom = true;
    this.customFormTabs.push(tab);
  }

  getCustomFormTabs()
  {
    return this.customFormTabs;
  }

}
