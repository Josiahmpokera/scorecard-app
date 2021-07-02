import {Button} from '@dhis2/ui'
import AddIcon from "@material-ui/icons/Add";
import {isEmpty} from 'lodash'
import React, {Fragment, useState} from 'react'
import {useRecoilState, useSetRecoilState} from "recoil";
import ScorecardIndicator from "../../../../../../core/models/scorecardIndicator";
import {ScorecardEditState, ScorecardStateSelector} from "../../../../../../core/state/scorecard";
import DataSourceSelectorModal from "../DataConfiguration/Components/DataGroups/Components/DataSourceSelectorModal";
import HighlightedDataSourceConfigurationForm from "./HighlightedDataSourceConfigurationForm";
import HighlightedIndicatorsTable from "./Table";

export default function HighlightedIndicatorsScorecardForm() {
    const [highlightedIndicators, setHighlightedIndicators] = useRecoilState(ScorecardStateSelector('highlightedIndicators'))
    const setScorecardEditorState = useSetRecoilState(ScorecardEditState)
    const [addOpen, setAddOpen] = useState(false);

    const onAddClick = () => {
        setAddOpen(true)
    }

    const onAdd = (dataSources) => {
        const newDataSources = dataSources?.map(source => (new ScorecardIndicator({...source, label: source?.displayName})))
        setHighlightedIndicators(prevState => [
            ...(prevState || []),
            ...(newDataSources || [])
        ])
        if (!isEmpty(dataSources)) {
            setScorecardEditorState(prevState => ({
                ...prevState,
                selectedHighlightedIndicatorIndex: 0
            }))
        }
    }

    return (
        <div className='column' style={{height: '100%'}}>
            <h3>Highlighted Indicators</h3>
            {
                !isEmpty(highlightedIndicators) ?
                    <Fragment>
                        <div className='row '>
                            <Button onClick={onAddClick} primary icon={<AddIcon/>}>Add</Button>
                        </div>
                        <div className='row'>
                            <div className='column pt-32'>
                                <HighlightedIndicatorsTable/>
                            </div>
                            <div className='column'>
                                <div className='pl-16 pt-32'>
                                    <HighlightedDataSourceConfigurationForm/>
                                </div>
                            </div>
                        </div>
                    </Fragment> :
                    <div className='row align-items-center center flex-1'>
                        <Button onClick={onAddClick} primary icon={<AddIcon/>}>Add Highlighted Indicator</Button>
                    </div>
            }
            {
                addOpen && <DataSourceSelectorModal open={addOpen} onSelect={onAdd}
                                                    disabled={highlightedIndicators?.map(({id}) => id)}
                                                    onClose={() => setAddOpen(false)}/>
            }
        </div>
    )
}
