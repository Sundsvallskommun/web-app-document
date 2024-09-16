import DefaultLayout from '@layouts/default-layout/default-layout.component';
import Main from '@layouts/main/main.component';
import { useUserStore } from '@services/user-service/user-service';
import { useTranslation } from 'next-i18next';
import { shallow } from 'zustand/shallow';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { capitalize } from 'underscore.string';
import { Fragment, useState, useEffect, useCallback } from 'react';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { Link, Button, Checkbox, Combobox, Select, useSnackbar, Pagination, Input, Spinner, ZebraTable, ZebraTableColumn, ZebraTableHeader } from '@sk-web-gui/react';
import { Document, translateLegalId, searchDocuments } from '@services/document-service/search-document-service'
import { getMunicipalities, Municipality } from '@services/municipality-service/municipality-service';
import dayjs from 'dayjs';
import { DialogDocumentDetails } from '@components/dialogs/dialog_documentdetails';

export const SearchDocumentPage: React.FC = () => {
  const sizes = [5,10,15,20]
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality>(null);
  const [pageSize, setPageSize] = useState<number>(10);
  const user = useUserStore((s) => s.user, shallow);
  const { t } = useTranslation();
  const [isInvalidInput, setIsInvalidInput] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const snackBar = useSnackbar();
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [legalId, setLegalId] = useState<string>(null);
  const [isIncludeConfidential, setIsIncludeConfidential] = useState<boolean>(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [sortObject, setSortObject] = useState<{ [key: string]: string }>({'registrationNumber': 'desc'});
  const [selectedDocument, setSelectedDocument] = useState<Document>(null);
  const [paginationData, setPaginationData] = useState<{
    page: number;
    totalPages: number;
    totalElements: number;
  }|null>(null);

  const handleSelectedMunicipalityId: React.ComponentProps<typeof Combobox.Input>['onChange'] = e => {
    if (e?.target?.value) {
      setSelectedMunicipality(municipalities.find(m => m.municipalityId === e.target.value));
    }
  };
  
  const openDetails = (index: number) => {
    setSelectedDocument(documents[index]);
    setIsDetailOpen(true);
  };

  const closeHandler = () => {
    setIsDetailOpen(false);
  };

  const changeInput = (input: string) => {
    setIsInvalidInput(false);
    setDocuments([]);
    setPaginationData(null);
    setLegalId(input);
  };

  const searchIfEnterPressed = (pressedKey: string) => {
    if (pressedKey && pressedKey === 'Enter') {
      search();
    }
  };
  
  const search = () => {
    if (legalId === null ||
      (legalId.replace('-', '').length != 12 && legalId.replace('-', '').length != 10)) {
      setIsInvalidInput(true);
      return;
    }

    setIsLoading(true);
    translateLegalId(legalId.replace('-', ''))
      .then((partyId: string) => {
        if (!partyId) {
          throw new Error('No matching partyId');
        }
        loadDocuments(partyId, 0);
      })
      .catch((e) => {
        handleError('Error when loading matching documents:', e, t('search_documents:errors.legalIdNotTranslatable'));
      });
  };
  
  const switchPage = (page: number) => {
    translateLegalId(legalId.replace('-', ''))
      .then((partyId: string) => {
        if (!partyId) {
          throw new Error('No matching partyId');
        }
        loadDocuments(partyId, page);
      })
      .catch((e) => {
        handleError('Error when loading matching documents:', e, t('search_documents:errors.legalIdNotTranslatable'));
      });
  };
  
  const loadDocuments = (partyId: string, page: number) => {
    searchDocuments(selectedMunicipality.municipalityId, partyId, isIncludeConfidential, page, pageSize, sortObject)
      .then((res) => {
        setDocuments(res.documents);
        setPaginationData({
          page: res.page,
          totalPages: res.totalPages,
          totalElements: res.totalRecords,
        });

        if (res.totalRecords < 1) {
          snackBar({
		    message: `${t('search_documents:no_matching_documents-prefix')} ${selectedMunicipality.name} ${t('search_documents:no_matching_documents-suffix')}`,
            status: 'info',
            position: 'top',
            closeable: false
          });
        }
      })
      .then(() => setIsLoading(false))
      .catch((e) => {
        handleError('Error when loading matching documents:', e, t('search_documents:errors.errorSearchingDocuments'));
      });
  };
  
  const handleError = (errorDescription: string, e: Error, message: string) => {
    console.error(errorDescription, e);
    snackBar({
      message: message,
      status: 'error',
      position: 'top',
      closeable: false
    });
    setDocuments([]);
    setPaginationData(null);
    setIsLoading(false);
  };
  
  const formatLegalId = (legalId: string): string => {
    return legalId.replace(/(.{4}$)/, '-$1');
  };
 
  useEffect(() => {
    if (legalId) {
      setDocuments([]);
      setPaginationData(null);
	  search();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSize]);
  
  const sortHandler = useCallback((sortColumn: number, sortAscending: boolean) => {
    const sortColumns:string[] = ['registrationNumber', 'description', 'confidentiality.confidential', 'created', 'createdBy'];
    const columName = sortColumns[sortColumn];
    const new_sort = {[columName]: sortAscending ? 'asc' : 'desc'}; 
    setSortObject(new_sort);
  }, []); 

  useEffect(() => {
    if (legalId) {
      switchPage(paginationData?.page);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortObject]);
  
  useEffect(() => {
    setSelectedMunicipality(municipalities.find(m => m.municipalityId === '2281')); // Hardcoded to Sundsvalls kommun, in the future we might able to determine it from userinformation in AD
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [municipalities]);

  useEffect(() => {
    getMunicipalities()
      .then(res => {
        setMunicipalities(res);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const labels = [
    {
      label: t(`search_documents:searchtable_headers.diarynumber`),
      sortable: true,
      screenReaderOnly: false
    },
    {
      label: t(`search_documents:searchtable_headers.description`),
      sortable: true,
      screenReaderOnly: false
    },
    {
      label: t(`search_documents:searchtable_headers.confidentiality`),
      sortable: true,
      screenReaderOnly: false
    },
    {
      label: t(`search_documents:searchtable_headers.created`),
      sortable: true,
      screenReaderOnly: false
    },
    {
      label: t(`search_documents:searchtable_headers.created_by`),
      sortable: true,
      screenReaderOnly: false
    }
  ];
  
  const headers: ZebraTableHeader[] = labels.map((l, idx) => ({
    element: (
      <span className="font-bold" key={`mh${idx}`}>{l.label}</span>
    ),
    isShown: true,
    isColumnSortable: l.sortable,
    screenReaderOnly: l.screenReaderOnly,
  }));

  const rows: ZebraTableColumn[][] = documents.map((r: Document, idx) => {
    return [
      {
        element: (
          <Fragment key={`mr${r.id}`}>
            <span><Link href="#" onClick={() => openDetails(idx)}>{r.registrationNumber}</Link></span>
          </Fragment>
        ),
        isShown: true
      },
      {
        element: (
          <Fragment key={`mr${r.id}`}>
            <span>{r.description}</span>
          </Fragment>
        ),
        isShown: true
      },
      {
        element: (
          <Fragment key={`mr${r.id}`}>
            <span>
              {r.confidentiality.confidential ? t(`search_documents:confidential`) : t(`search_documents:public`)}
            </span>
          </Fragment>
        ),
        isShown: true
      },
      {
        element: (
          <Fragment key={`mr${r.id}`}>
            <span>{dayjs(r.created).format('YYYY-MM-DD HH:mm')}</span>
          </Fragment>
        ),
        isShown: true
      },
      {
        element: (
          <Fragment key={`mr${r.id}`}>
            <span>{r.createdBy}</span>
          </Fragment>
        ),
        isShown: true
      }
    ];
  });

  return (
    <DefaultLayout title={`${process.env.NEXT_PUBLIC_APP_NAME} - ${t('search_documents:title')}`}>
      <div className='muncipalityDropdown'>
        <Combobox
          placeholder={t('common:select-municipality')}
          searchPlaceholder={t('common:search-placeholder')}
          value={selectedMunicipality?.municipalityId}
          multiple={false}
          onChange={(e) => handleSelectedMunicipalityId(e)}
        >
          <Combobox.List>
            {municipalities.map(item => <Combobox.Option key={`cb-municipality-${item.municipalityId.toString()}`} value={item.municipalityId.toString()}>
              {item.name}
            </Combobox.Option>)}
          </Combobox.List>
          
        </Combobox>
      </div>
      <DialogDocumentDetails open={isDetailOpen} document={selectedDocument} onClose={closeHandler}/>

      <Main>
        <div>
          <h3>
            {capitalize(`${t('common:welcome')} ${user.name ? user.name : ''}!`)}
          </h3>
          <p style={{ marginBottom: '2em'}}>
          	{t('search_documents:description-prefix')}
          	&nbsp;{selectedMunicipality?.name}&nbsp;
          	{t('search_documents:description-suffix')}
          </p>
          
          <p>
            <Checkbox
              className={isInvalidInput ? 'input-and-button border border-error' : 'input-and-button'}
              onChange={(e) => setIsIncludeConfidential(e.target.checked)}
            >
              {t('search_documents:include_confidential')}
            </Checkbox>
          </p>
          
          <p>
            <Input
              placeholder='YYYYMMDD-NNNN'
              disabled={isLoading}
              className={isInvalidInput ? 'input-and-button border border-error' : 'input-and-button'}
              autoFocus={true}
              onChange={(e) => changeInput(e.target.value)}
              onKeyDown={(e) => searchIfEnterPressed(e.key)}
              data-cy="search-legalId"
            />
            <Button
              type="button"
              className="input-and-button"
              onClick={() => search()}
              disabled={isLoading || legalId === null || legalId.length === 0}
              leftIcon={
                isLoading ? <Spinner /> : <SearchOutlinedIcon />
              }>
              {isLoading ? t('search_documents:ongoing_search') : t('search_documents:search')}
            </Button>

            {isInvalidInput &&
              <div>
                {t('search_documents:errors.invalidLegalId')}
              </div>
            }
          </p>
          
          <p>
            <Select 
              size={'sm'}
              value={pageSize}
              onSelectValue={(e) => setPageSize(e)}
            >
              {sizes.map(size => <Select.Option key={size} value={size}>
                {size}
              </Select.Option>)}
            </Select> {t('search_documents:documents_per_page')}
          </p>
        </div>

        <div style={{ marginTop: '2em' }}>
          {documents.length > 0 &&
            <div>
              <h4>
                {paginationData.totalElements} {t('search_documents:matching_documents')} {formatLegalId(legalId)} ({t('search_documents:displaying_page')} {paginationData.page + 1} {t('search_documents:of')} {paginationData.totalPages})
              </h4>

              <div className={`w-full px-lg mt-sm border-b border-gray-stroke`}></div>

              <ZebraTable
                aria-label="t('search_documents:document_table_title')"
                data-cy="main-table"
                activePage={paginationData?.page + 1 || 1}
                pageSize={pageSize}
                headers={headers}
                rows={rows}
                tableSortable={true}
                sortHandler={sortHandler}
                defaultSort={{ idx: 0, sortMode: false }}
              />

              {paginationData?.totalPages > 1 && (
                <div>
                  <div className="w-full px-lg mt-sm border-t border-gray-stroke"></div>
                  <Pagination
                    pages={paginationData?.totalPages}
                    activePage={paginationData?.page + 1}
                    changePage={(p) => {
                      switchPage(p - 1);
                    }}
                  />
                  <div className="w-full px-lg mt-sm border-b border-gray-stroke"></div>
                </div>
              )}

            </div>}
        </div>
      </Main>
    </DefaultLayout >
  );
};

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common', 'search_documents', 'dialog_documentdetails', 'layout'])),
  },
});

export default SearchDocumentPage;
