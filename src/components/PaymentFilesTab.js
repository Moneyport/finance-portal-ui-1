
import React, { useState, useEffect } from 'react';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { DatePicker, dateToStr } from './DatePicker';

import { get, triggerDownload } from '../requests';


function PaymentFilesList(props) {
  const { paymentFileList } = props;

  const downloadFile = settlementFileId => {
    triggerDownload(`payment-file/${settlementFileId}`);
  };

  return (
    <List>
    {paymentFileList.map(pf =>
      <ListItem key={pf.settlementFileId} button onClick={() => downloadFile(pf.settlementFileId)}>
        <ListItemText>[{pf.settlementFileId}] | [{pf.settlementId}] | [{pf.createdDate}]</ListItemText>
      </ListItem>
    )}
    </List>
  );
}


// TODO: show the user a spinner or something while the query is in progress
function PaymentFilesTab(props) {
  const { classes } = props;
  const [endDate, setEndDate] = useState(dateToStr(new Date(Date.now() + 1000 * 60 * 60 * 24)));
  const [startDate, setStartDate] = useState(dateToStr(new Date())); // one week ago
  const [paymentFileList, setPaymentFileList] = useState([]);

  const updateQuery = (startDate, endDate) => {
    get(`payment-file-list?startDate=${startDate}&endDate=${endDate}`)
      .then(setPaymentFileList)
      .catch(err => window.alert('Failed to get FSPS')); // TODO: better error message, let user retry
  };

  useEffect(() => updateQuery(startDate, endDate), []);

  return (
    <>
      <DatePicker defDate={startDate} classes={classes} selectDate={dt => { setStartDate(dt); updateQuery(dt, endDate); }} />
      <DatePicker defDate={endDate} classes={classes} selectDate={dt => { setEndDate(dt); updateQuery(startDate, dt); }} />
      <PaymentFilesList paymentFileList={paymentFileList} startDate={startDate} endDate={endDate} />
    </>
  );
}

export default PaymentFilesTab;
