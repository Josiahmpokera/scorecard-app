import i18n from "@dhis2/d2-i18n";
import {DataTableCell, DataTableRow, InputField} from "@dhis2/ui";
import {debounce} from "lodash";
import PropTypes from "prop-types";
import React, {useEffect, useState} from "react";
import {useRecoilState, useRecoilValue} from "recoil";
import {PeriodResolverState} from "../../../../../../../../../core/state/period";
import {ScorecardTableOrientationState, ScorecardViewState} from "../../../../../../../../../core/state/scorecard";


export default function OrgUnitHeaderRow({nested}) {
    const {orgUnits} = useRecoilValue(ScorecardViewState('orgUnitSelection'))
    const periods = useRecoilValue(PeriodResolverState) ?? []
    const [keyword, setKeyword] = useRecoilState(ScorecardViewState('orgUnitSearchKeyword'))
    const orientation = useRecoilValue(ScorecardTableOrientationState)
    const [searchValue, setSearchValue] = useState(keyword);

    const onSearchChange = debounce(setKeyword)

    useEffect(() => {
        onSearchChange(searchValue)
    }, [searchValue])

    return (
        <DataTableRow>
            <DataTableCell fixed left={"0"} width={"50px"}/>
            <DataTableCell align='center' fixed top={"0"} left={"50px"} width={"300px"} bordered
                           className='scorecard-table-header scorecard-org-unit-cell' rowSpan={"3"}>
                {
                    !nested && <InputField value={searchValue} onChange={({value}) => setSearchValue(value)}
                                           placeholder={orientation === 'orgUnitVsData' ? i18n.t('Search Organisation Unit') : i18n.t('Search Data')}/>
                }
            </DataTableCell>
            {
                orgUnits?.map(({displayName, id}) => (
                    <DataTableCell fixed className='scorecard-table-header' align='center' bordered
                                   colSpan={`${(periods?.length ?? 1)}`} key={id}>
                        {displayName}
                    </DataTableCell>
                ))
            }
        </DataTableRow>
    )
}

OrgUnitHeaderRow.propTypes = {
    nested: PropTypes.bool.isRequired
};
