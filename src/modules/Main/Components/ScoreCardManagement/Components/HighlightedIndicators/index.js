import i18n from "@dhis2/d2-i18n";
import {Button} from "@dhis2/ui";
import AddIcon from "@material-ui/icons/Add";
import {isEmpty} from "lodash";
import React, {Fragment, useState} from "react";
import {useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import {HIGHLIGHTED_INDICATOR_HELP_STEPS} from "../../../../../../core/constants/help/scorecardManagement";
import ScorecardIndicator from "../../../../../../core/models/scorecardIndicator";
import {ScorecardConfigDirtyState, ScorecardConfigEditState,} from "../../../../../../core/state/scorecard";
import {generateLegendDefaults} from "../../../../../../shared/utils/utils";
import DataSourceSelectorModal from "../DataConfiguration/Components/DataGroups/Components/DataSourceSelectorModal";
import Help from "../Help";
import HighlightedDataSourceConfigurationForm from "./HighlightedDataSourceConfigurationForm";
import HighlightedIndicatorsTable from "./Table";

export default function HighlightedIndicatorsScorecardForm() {
    const [highlightedIndicators, setHighlightedIndicators] = useRecoilState(
        ScorecardConfigDirtyState("highlightedIndicators")
    );
    const legendDefinitions = useRecoilValue(
        ScorecardConfigDirtyState("legendDefinitions")
    );
    const setScorecardEditorState = useSetRecoilState(ScorecardConfigEditState);
    const [addOpen, setAddOpen] = useState(false);

    const onAddClick = () => {
        setAddOpen(true);
    };

    const onAdd = (dataSources) => {
        const legendDefaults = generateLegendDefaults(legendDefinitions, 100);
        const newDataSources = dataSources?.map(
            (source) =>
                new ScorecardIndicator({
                    ...source,
                    label: source?.displayName,
                    legends: legendDefaults,
                })
        );
        setHighlightedIndicators((prevState) => [
            ...(prevState || []),
            ...(newDataSources || []),
        ]);
        if (!isEmpty(dataSources)) {
            setScorecardEditorState((prevState) => ({
                ...prevState,
                selectedHighlightedIndicatorIndex: 0,
            }));
        }
    };

    return (
        <div className="column" style={{height: "100%"}}>
            <Help helpSteps={HIGHLIGHTED_INDICATOR_HELP_STEPS}/>
            <h3>{i18n.t("Highlighted Indicators")}</h3>
            {!isEmpty(highlightedIndicators) ? (
                <Fragment>
                    <div className="row ">
                        <Button
                            className="add-highlighted-indicator-button"
                            onClick={onAddClick}
                            icon={<AddIcon/>}
                        >
                            {i18n.t("Add")}
                        </Button>
                    </div>
                    <div className="row">
                        <div className="col-md-8 pt-32 ">
                            <HighlightedIndicatorsTable/>
                        </div>
                        <div className="col-md-4">
                            <div className="pl-16 pt-32">
                                <HighlightedDataSourceConfigurationForm/>
                            </div>
                        </div>
                    </div>
                </Fragment>
            ) : (
                <div  className="row align-items-center center flex-1">
                    <Button
                        className="add-highlighted-indicator-button"
                        onClick={onAddClick}
                        icon={<AddIcon/>}
                    >
                        {i18n.t("Add Highlighted Indicator")}
                    </Button>
                </div>
            )}
            {addOpen && (
                <DataSourceSelectorModal
                    open={addOpen}
                    onSelect={onAdd}
                    disabled={highlightedIndicators?.map(({id}) => id)}
                    onClose={() => setAddOpen(false)}
                />
            )}
        </div>
    );
}
