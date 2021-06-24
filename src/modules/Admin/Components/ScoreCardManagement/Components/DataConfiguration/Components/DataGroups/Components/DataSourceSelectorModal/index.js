import i18n from '@dhis2/d2-i18n'
import {Button, ButtonStrip, Modal, ModalActions, ModalContent, ModalTitle} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, {useState} from 'react'
import DataSourceSelector from "../../../../../../../../../../shared/Components/DataSourceSelector";


export default function DataSourceSelectorModal({onClose, open, onSelect, disabled}) {
    const [selectedItems, setSelectedItems] = useState([]);

    return (
        <Modal onClose={onClose} position={'middle'} large hide={!open}>
            <ModalTitle>{i18n.t('Add Data source')}</ModalTitle>
            <ModalContent>
                <div className='w-100'>
                    <DataSourceSelector disabled={disabled} onSubmit={setSelectedItems}/>
                </div>
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button onClick={onClose} >{i18n.t('Cancel')}</Button>
                    <Button primary onClick={() => {
                        onSelect(selectedItems)
                        onClose()
                    }}>{i18n.t('Add')}</Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}

DataSourceSelectorModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    disabled: PropTypes.array,
    open: PropTypes.bool,


};
