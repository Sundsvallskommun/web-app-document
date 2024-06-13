import { Button, Dialog, Link, Divider, useSnackbar } from '@sk-web-gui/react';
import { ApiDocument, ApiDocumentData } from '@interfaces/document';
import dayjs from 'dayjs';
import {useState} from "react";
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useTranslation } from 'next-i18next';
import { fetchDocumentFile } from '@services/document-service/search-document-service'

interface DialogDocumentDetailsProps {
  open: boolean;
  document: ApiDocument;
  onClose: (confirm: boolean) => void;
}

export const DialogDocumentDetails: React.FC<DialogDocumentDetailsProps> = ({ open, document, onClose }) => {
  const { t } = useTranslation();
  const [metadataVisible, setMetadataVisible] = useState(false);
  const snackBar = useSnackbar();
  const handleOnClose = () => {
    setMetadataVisible(false);
    onClose(true);
  };
  
  const format: ( value: string ) => string = (value) => {
    try {
      const json = JSON.parse(value);
      if ((typeof json === 'object')) {
        return Object.entries(JSON.parse(value)).map((entry) => {
          return "<p>" + entry[0] + " : " + entry[1] + "</p>";
        }).join("");
      }
      return "<p>" + value + "</p>";
    } catch (e) {
      return "<p>" + value + "</p>";
    }
  };
  
  const fetchFile = ( documentData : ApiDocumentData ) => {
    fetchDocumentFile(document.registrationNumber, documentData.id, document.confidentiality?.confidential || false)
      .then((res) => {
        const uri = `data:${documentData.mimeType};base64,${res}`;
        const link = window.document.createElement('a');
        link.href = uri;
        link.setAttribute('download', `${documentData.fileName}`);
        window.document.body.appendChild(link);
        link.click();
      })
      .catch((e) => {
        console.error('Error occurred during download', e);
        snackBar({
          message: t('dialog_documentdetails:errors.filedownload'),
          status: 'error',
          position: 'top'
        });
    });
  };

  const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const niceBytes = (x: number): string => {
    let l = 0, n = parseInt(x.toString(), 10) || 0;
    while(n >= 1024 && ++l){
      n = n/1024;
    }
    return (n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
  };

  return (
    <Dialog show={open} className="md:min-w-[100rem]">
    {document &&
      <Dialog.Content>
        <h6>{t('dialog_documentdetails:header')} {document.registrationNumber}</h6>
        <Divider.Section>{t('dialog_documentdetails:sections.common.header')}</Divider.Section>
        <table>
          <tr>
            <td>
              {t('dialog_documentdetails:sections.common.table.headers.description')}
            </td>
            <td>
              {document.description}
            </td>
          </tr>
          <tr>
            <td>
              {t('dialog_documentdetails:sections.common.table.headers.sensitivity')}
            </td>
            <td>
              {document.confidentiality?.confidential && <p>{t('dialog_documentdetails:sections.common.table.rows.confidential')}</p>}
              {!document.confidentiality?.confidential && <p>{t('dialog_documentdetails:sections.common.table.rows.public')}</p>}
            </td>
          </tr>
          {document.confidentiality?.confidential &&
          document.confidentiality?.legalCitation &&
          <tr>
            <td>
              {t('dialog_documentdetails:sections.common.table.headers.legalCitation')}
            </td>
            <td>
              {document.confidentiality.legalCitation}
            </td>
          </tr>
          }
          <tr>
            <td>
              &nbsp;
            </td>
            <td>
              &nbsp;
            </td>
          </tr>
          <tr>
            <td>
              <p>{t('dialog_documentdetails:sections.common.table.headers.revision')}</p>
            </td>
            <td>
              {document.revision}
            </td>
          </tr>
          <tr>
            <td>
              {t('dialog_documentdetails:sections.common.table.headers.created')}
            </td>
            <td>
              {dayjs(document.created).format('YYYY-MM-DD HH:mm')} {t('dialog_documentdetails:sections.common.table.rows.by')} {document.createdBy}
            </td>
          </tr>
          <tr>
            <td>
              {t('dialog_documentdetails:sections.common.table.headers.archive')}
            </td>
            <td>
              {document.archive}
              {document.archive && <p>{t('dialog_documentdetails:sections.common.table.rows.yes')}</p>}
              {!document.archive && <p>{t('dialog_documentdetails:sections.common.table.rows.no')}</p>}
            </td>
          </tr>
        </table>
        <Divider.Section>
          {document.documentData.length > 1 ? (<span>{t('dialog_documentdetails:sections.files.header.multiple')}</span>) : 
          (<span>{t('dialog_documentdetails:sections.files.header.single')}</span>)}
        </Divider.Section>
        <table>
        {document.documentData.map((documentData) => (
          <tr key={documentData.id}>
            <td>
              {documentData.fileName}
            </td>
            <td>
              {t('dialog_documentdetails:sections.files.rows.filesize')} {niceBytes(documentData.fileSizeInBytes)}
            </td>
            <td>
              <Link
                onClick={() => fetchFile(documentData)}
                href={'#'}
                className="no-underline w-full lg:w-44"
              >
                <span className="relative leading-[2.8rem]">
                  {t('dialog_documentdetails:sections.files.rows.download_document')}
                  <OpenInNewIcon className="!w-[1.4rem] !h-[1.4rem] absolute -right-7 top-2" />
                </span>
              </Link>
            </td>
          </tr>
        ))}
        </table>
        <Divider.Section>
          {t('dialog_documentdetails:sections.metadata.header.metadata')}&nbsp;
          <Link href="#" onClick={() => setMetadataVisible(!metadataVisible)}>
            ({metadataVisible ? (<span>{t('dialog_documentdetails:sections.metadata.header.hide')}</span>) : 
            (<span>{t('dialog_documentdetails:sections.metadata.header.show')}</span>)})
          </Link>
        </Divider.Section>
        {metadataVisible && 
        <div>
          <table>
          {document.metadataList.map((metaData, idx) => (
            <tr key={metaData.key + idx}>
              <td className="metadata">
                {metaData.key}
              </td>
              <td>
                <div className="metadata" dangerouslySetInnerHTML={{__html: format(metaData.value)}} />
              </td>
            </tr>
          ))}
          </table>
        <div className="w-full px-lg mt-sm border-t border-gray-stroke border-thin"></div>
        </div>
        }
      </Dialog.Content>}
      <Dialog.Buttons>
        <Button variant="primary" color="success" onClick={() => handleOnClose()}>
          {t('dialog_documentdetails:buttons.close')}
        </Button>
      </Dialog.Buttons>
    </Dialog>
  );
};