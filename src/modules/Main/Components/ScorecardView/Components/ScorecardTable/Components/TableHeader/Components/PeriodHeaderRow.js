import {DataTableColumnHeader, DataTableRow} from "@dhis2/ui";
import {head} from "lodash";
import PropTypes from "prop-types";
import React from "react";
import {useRecoilState, useRecoilValue} from "recoil";
import {Orientation} from "../../../../../../../../../core/constants/orientation";
import {PeriodResolverState} from "../../../../../../../../../core/state/period";
import {
    ScorecardOrgUnitState,
    ScorecardTableOrientationState,
    ScorecardTableSortState,
    ScorecardViewState,
} from "../../../../../../../../../core/state/scorecard";
import classes from '../../../scorecardTable.module.css'

export default function PeriodHeaderRow({orgUnits}) {
    const {dataGroups} =
    useRecoilValue(ScorecardViewState("dataSelection")) ?? {};
    const {filteredOrgUnits, childrenOrgUnits} =
    useRecoilValue(ScorecardOrgUnitState(orgUnits)) ?? {};
    const orientation = useRecoilValue(ScorecardTableOrientationState);
    const periods = useRecoilValue(PeriodResolverState) ?? [];
    const [{name: sortName, direction}, setDataSort] = useRecoilState(
        ScorecardTableSortState
    );

    const onSortClick = (direction) => {
        setDataSort({
            ...direction,
            type: "period",
        });
    };

    return (
        <DataTableRow>
            {orientation === Orientation.ORG_UNIT_VS_DATA
                ? dataGroups?.map(({dataHolders}) =>
                    dataHolders?.map(({id, dataSources}) =>
                        periods?.map(({name, id: periodId}) => (
                            <DataTableColumnHeader
                                dataTest={"test-period-table-scorecard"}
                                fixed
                                top={"0"}
                                onSortIconClick={onSortClick}
                                sortDirection={
                                    sortName === `${head(dataSources)?.id}-${periodId}`
                                        ? direction
                                        : "default"
                                }
                                width={"100px"}
                                bordered
                                align="center"
                                key={`${id}-${periodId}`}
                                className={classes["period-header-cell"]}
                                name={`${head(dataSources)?.id}-${periodId}`}
                            >
                                {name}
                            </DataTableColumnHeader>
                        ))
                    )
                )
                : [...filteredOrgUnits, ...childrenOrgUnits]?.map(({id}) =>
                    periods?.map(({name, id: periodId}) => (
                        <DataTableColumnHeader
                            dataTest={"test-period-table-scorecard"}
                            fixed
                            top={"0"}
                            onSortIconClick={onSortClick}
                            sortDirection={
                                sortName === `${id}-${periodId}` ? direction : "default"
                            }
                            width={"100px"}
                            bordered
                            align="center"
                            key={`${id}-${periodId}`}
                            className="scorecard-table-cell header"
                            name={`${id}-${periodId}`}
                        >
                            {name}
                        </DataTableColumnHeader>
                    ))
                )}
        </DataTableRow>
    );
}

PeriodHeaderRow.propTypes = {
    orgUnits: PropTypes.arrayOf(PropTypes.object).isRequired,
};
