import {Component, OnInit, AfterViewInit, ViewChild, ValueProvider} from '@angular/core';
import {Http} from "@angular/http";
import {ScoreCard, ScorecardService} from "../shared/services/scorecard.service";
import {ActivatedRoute} from "@angular/router";
import {Subscription} from "rxjs";
import {DataService} from "../shared/data.service";
import {FilterService} from "../shared/services/filter.service";
import {Constants} from "../shared/costants";
import {OrgUnitService} from "../shared/services/org-unit.service";
import {TreeNode, TREE_ACTIONS, IActionMapping, TreeComponent} from 'angular2-tree-component';
import {Angular2Csv} from "angular2-csv";

const actionMapping:IActionMapping = {
  mouse: {
    dblClick: TREE_ACTIONS.TOGGLE_EXPANDED,
    click: (node, tree, $event) => {
      $event.shiftKey
        ? TREE_ACTIONS.TOGGLE_SELECTED_MULTI(node, tree, $event)
        : TREE_ACTIONS.TOGGLE_SELECTED(node, tree, $event)
    }
  }
};

const WINDOW_PROVIDER: ValueProvider = {
  provide: Window,
  useValue: window
};

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit, AfterViewInit {

  private subscription: Subscription;
  scorecard: ScoreCard;
  scorecardId: string;
  orgUnit: any = {};
  period: any = {};
  lastPeriod: string = "2015Q4";
  loading_message:string = "";
  orgunits: any[] = [];
  proccessed_percent = 0;
  loading: boolean = true;
  searchQuery: string = null;
  tree_orgunits: any[] = [];
  orgunit_levels: any = 1;
  base_url: string;
  orgunit_tree_config: any = {
    show_search : true,
    search_text : 'Search',
    level: null,
    loading: false,
    loading_message: 'Loading Organisation units...',
    multiple: true,
    placeholder: "Select Organisation Unit"
  };

  period_tree_config: any = {
    show_search : true,
    search_text : 'Search',
    level: null,
    loading: false,
    loading_message: 'Loading Periods...',
    multiple: true,
    placeholder: "Select period"
  };
  organisationunits: any[] = [];
  periods: any[] = [];
  selected_orgunits: any[] = [];
  selected_periods:any[] = [];
  period_type: string = "Quarterly";
  year: number = 2016;
  default_orgUnit: string[] = [];
  default_period: string[] = [];
  showOrgTree:boolean = true;
  showPerTree:boolean = true;

  @ViewChild('orgtree')
  orgtree: TreeComponent;

  @ViewChild('pertree')
  pertree: TreeComponent;

  constructor(private scorecardService: ScorecardService,
              private dataService: DataService,
              private activatedRouter: ActivatedRoute,
              private filterService: FilterService,
              private costant: Constants,
              private orgunitService: OrgUnitService
  ) {
    this.base_url = this.costant.root_dir;
    this.subscription = this.activatedRouter.params.subscribe(
      (params: any) => {
        this.scorecardId = params['scorecardid'];
        this.scorecard = this.getEmptyScoreCard();
      });
    this.periods = this.filterService.getPeriodArray( this.period_type, this.year );
    this.period = {
      id:this.filterService.getPeriodArray( this.period_type, this.year )[0].id,
      name:this.filterService.getPeriodArray( this.period_type, this.year )[0].name
    };

  }

  pushPeriodForward(){
    this.year += 1;
    this.periods = this.filterService.getPeriodArray(this.period_type,this.year);
  }

  pushPeriodBackward(){
    this.year -= 1;
    this.periods = this.filterService.getPeriodArray(this.period_type,this.year);
  }

  changePeriodType(){
    this.periods = this.filterService.getPeriodArray(this.period_type,this.year);
  }
  ngOnInit() {
    //loading organisation units

    this.periods = this.filterService.getPeriodArray( this.period_type, this.year );
    this.orgunit_tree_config.loading = true;
    if (this.orgunitService.nodes == null){
      this.subscription = this.orgunitService.getOrgunitLevelsInformation()
        .subscribe(
          (data: any) => {
            this.filterService.getInitialOrgunitsForTree().subscribe(
              (initial_data) => {
                this.orgUnit = {
                  id:initial_data.organisationUnits[0].id,
                  name: initial_data.organisationUnits[0].name,
                  children: initial_data.organisationUnits[0].children
                };
                this.loadScoreCard();
                this.organisationunits = initial_data.organisationUnits;
                let fields = this.orgunitService.generateUrlBasedOnLevels( data.pager.total);
                this.orgunitService.getAllOrgunitsForTree( fields )
                  .subscribe(
                    (orgUnits: any) => {
                      this.organisationunits = orgUnits.organisationUnits;
                      this.orgunitService.nodes = orgUnits.organisationUnits;
                      this.orgunitService.sortOrgUnits( data.pager.total );
                      // this.activateNode(this.orgUnit.id, this.orgtree);
                      this.orgunit_tree_config.loading = false;
                    },
                    error => {
                      console.log('something went wrong while fetching Organisation units');
                      this.orgunit_tree_config.loading = false;
                    }
                  );
              });
          },
          error => {
            console.log('something went wrong while fetching Orga/////tion units ');
            this.orgunit_tree_config.loading = false;
          }
        );
    }
    else{
      this.orgunit_tree_config.loading = false;
      this.default_orgUnit = [this.orgunitService.nodes[0].id];
      this.orgUnit = {
        id:this.orgunitService.nodes[0].id,
        name: this.orgunitService.nodes[0].name,
        children: this.orgunitService.nodes[0].children
      };

      this.organisationunits = this.orgunitService.nodes;

      this.orgunitService.sortOrgUnits( 4 );

      this.loadScoreCard();
    }

  }

  ngAfterViewInit(){
    this.activateNode(this.period.id, this.pertree);
    // this.activateNode(this.orgUnit.id, this.orgtree);

  }

  // a function to prepare a list of organisation units for analytics
  getOrgUnitsForAnalytics(selectedOrgunits): string{
    let orgUnits = [];
    orgUnits.push(selectedOrgunits.id);
    for( let orgunit of selectedOrgunits.children ){
      orgUnits.push(orgunit.id);
    }
    return orgUnits.join(";");
  }

  // a function that will be used to load scorecard
  loadScoreCard(){
    this.proccessed_percent = 0;
    this.loading = true;
    this.orgunits = [];
    this.showOrgTree = true;
    this.showPerTree = true;
    this.loading_message = " Getting scorecard details ";
    this.scorecardService.load(this.scorecardId).subscribe(
      scorecard_details => {
        this.scorecard = {
          id: this.scorecardId,
          data: scorecard_details
        };

        let proccesed_indicators = 0;
        let use_period = this.period.id+";"+this.filterService.getLastPeriod(this.period.id);
        let indicator_list = this.getIndicatorList(this.scorecard);
        for( let holder of this.scorecard.data.data_settings.indicator_holders ){
          for( let indicator of holder.indicators ){
            indicator['values'] = [];
            indicator['loading'] = true;
            indicator['showTopArrow'] = [];
            indicator['showBottomArrow'] = [];
            this.dataService.getIndicatorsRequest(this.getOrgUnitsForAnalytics(this.orgUnit),this.period.id, indicator.id)
              .subscribe(
                (data) => {
                  indicator.loading = false;
                  this.loading_message = " Done Fetching data for "+indicator.title;
                  proccesed_indicators++;
                  this.proccessed_percent = (proccesed_indicators / indicator_list.length) * 100;
                  if(proccesed_indicators == indicator_list.length ){
                    this.loading = false;
                  }
                  //noinspection TypeScriptUnresolvedVariable
                  for ( let orgunit of data.metaData.ou ){
                    if(!this.checkOrgunitAvailability(orgunit,this.orgunits)){
                      //noinspection TypeScriptUnresolvedVariable
                      this.orgunits.push({"id":orgunit, "name":data.metaData.names[orgunit]})
                    }
                    indicator.values[orgunit] = this.dataService.getIndicatorData(orgunit,this.period.id, data);
                  }

                },
                error => {

                }
              )
          }
        }
      });
  }

  downloadCSV(){
    let data = [];
      for ( let current_orgunit of this.orgUnit.children ){
        let dataobject = {};
        dataobject['orgunit'] = current_orgunit.name;
        for ( let holder of this.scorecard.data.data_settings.indicator_holders ){
          for( let indicator of holder.indicators ){
            dataobject[indicator.title] = indicator.values[current_orgunit.id];
          }
        }
        data.push( dataobject  );
      }

    let options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: false
    };

    new Angular2Csv(data, 'My Report', options);
  }

  browserPrint(){
    window.print();
  }


  checkOrgunitAvailability(id, array){
    let check = false;
    for( let orgunit of array ){
      if(orgunit.id == id){
        check = true;
      }
    }
    return check;
  }

  // a function to prepare a list of indicators to pass into a table
  getIndicatorList(scorecard): string[]{
    let indicators = [];
    for( let holder of scorecard.data.data_settings.indicator_holders ){
      for( let indicator of holder.indicators ){
        indicators.push(indicator.id);
      }
    }
    return indicators;
  }

  // A function used to decouple indicator list and prepare them for a display
  getItemsFromGroups(): any[]{
    let indicators_list = [];
    for(let data of this.scorecard.data.data_settings.indicator_holder_groups ){
      for( let holders_list of data.indicator_holder_ids ){
        for( let holder of this.scorecard.data.data_settings.indicator_holders ){
          if(holder.holder_id == holders_list){
            indicators_list.push(holder)
          }
        }
      }
    }
    return indicators_list;
  }

  // simplify title displaying by switching between two or on indicator
  getIndicatorTitle(holder): string{
    var title = [];
    for( let data of holder.indicators ){
      title.push(data.title)
    }
    return title.join(' / ')
  }

  // assign a background color to area depending on the legend set details
  assignBgColor(object,value): string{
    var color = "#BBBBBB";
    for( let data of object.legendset ){
      if(data.max == "-"){

        if(parseInt(value) >= parseInt(data.min) ){
          color = data.color;
        }
      }else{
        if(parseInt(value) >= parseInt(data.min) && parseInt(value) <= parseInt(data.max)){
          color = data.color;
        }
      }
    };
    return color;
  }

  // Define default scorecard sample
  getEmptyScoreCard():ScoreCard{
    return {
      id: this.scorecardId,
      data: {
        "orgunit_settings": {
          "parent": "USER_ORGUNIT",
          "level": "LEVEL-2"
        },
        "show_score": false,
        "show_rank": false,
        "rank_position_last": true,
        "header": {
          "title": "",
          "sub_title":"",
          "description": "",
          "show_arrows_definition": true,
          "show_legend_definition": false,
          "template": {
            "display": false,
            "content": ""
          }
        },
        "legendset_definitions": [
          {
            "color": "#008000",
            "definition": "Target achieved / on track"
          },
          {
            "color": "#FFFF00",
            "definition": "Progress, but more effort required"
          },
          {
            "color": "#FF0000",
            "definition": "Not on track"
          },
          {
            "color": "#D3D3D3",
            "definition": "N/A"
          },
          {
            "color": "#FFFFFF",
            "definition": "No data"
          }
        ],
        "highlighted_indicators": {
          "display": false,
          "definitions": []
        },
        "data_settings": {
          "indicator_holders": [],
          "indicator_holder_groups": []
        },
        "additional_labels": [],
        "footer": {
          "display_generated_date": false,
          "display_title": false,
          "sub_title": null,
          "description": null,
          "template": null
        },
        "indicator_dataElement_reporting_rate_selection": "Indicators"
      }
    }
  }

  // custom settings for tree
  customTemplateStringOptions: any = {
    isExpandedField: 'expanded',
    actionMapping
  };

  // display Orgunit Tree
  displayOrgTree(){
    this.showOrgTree = !this.showOrgTree;
  }

  // display period Tree
  displayPerTree(){
    this.showPerTree = !this.showPerTree;
  }

  // action to be called when a tree item is deselected(Remove item in array of selected items
  deactivateOrg ( $event ) {
    // this.selected_items.forEach((item,index) => {
    //   if( $event.node.data.id == item.id ) {
    //     this.selected_items.splice(index, 1);
    //   }
    // });
    // this.selected.emit(this.selected_items);
  };

  // action to be called when a tree item is deselected(Remove item in array of selected items
  deactivatePer ( $event ) {
    // this.selected_items.forEach((item,index) => {
    //   if( $event.node.data.id == item.id ) {
    //     this.selected_items.splice(index, 1);
    //   }
    // });
    // this.selected.emit(this.selected_items);
  };


  // add item to array of selected items when item is selected
  activateOrg = ($event) => {
    this.selected_orgunits = [$event.node.data];
    this.orgUnit = $event.node.data;
    console.log(this.orgUnit);
  };

  // add item to array of selected items when item is selected
  activatePer = ($event) => {
    this.selected_periods = [$event.node.data];
    this.period = $event.node.data;
    console.log(this.period);
  };

  activateNode(nodeId:any, nodes){
    setTimeout(() => {
      let node = nodes.treeModel.getNodeById(nodeId);
      if (node)
        node.toggleActivated();
    }, 0);
  }

  // function that is used to filter nodes
  filterNodes(text, tree) {
    tree.treeModel.filterNodes(text, true);
  }
}
