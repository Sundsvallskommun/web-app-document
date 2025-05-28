import DefaultLayout from '@layouts/default-layout/default-layout.component';
import Main from '@layouts/main/main.component';
import { useUserStore } from '@services/user-service/user-service';
import { useTranslation } from 'next-i18next';
import { shallow } from 'zustand/shallow';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { capitalize } from 'underscore.string';
import { useState, useEffect, useCallback } from 'react';
import { Link, Button, Checkbox, Combobox, Select, useSnackbar, Pagination, Input, Spinner, Image } from '@sk-web-gui/react';
import { Document, translateLegalId, searchDocuments } from '@services/document-service/search-document-service'
import { getMunicipalities, Municipality } from '@services/municipality-service/municipality-service';
import dayjs from 'dayjs';
import { DialogDocumentDetails } from '@components/dialogs/dialog_documentdetails';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { LucideIcon } from '@sk-web-gui/lucide-icon';
import { AutoTable } from '@sk-web-gui/table';

export const SearchDocumentPage: React.FC = () => {
  const router = useRouter();
  const { pathname, asPath, query } = router;  
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [selectedMunicipality, setSelectedMunicipality] = useState<Municipality>(null);
  const user = useUserStore((s) => s.user, shallow);
  const { t } = useTranslation();
  const [isInvalidInput, setIsInvalidInput] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const snackBar = useSnackbar();
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [legalId, setLegalId] = useState<string>(null);
  const [isIncludeConfidential, setIsIncludeConfidential] = useState<boolean>(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document>(null);
  const [paginationData, setPaginationData] = useState<{
    page: number;
    totalPages: number;
    totalElements: number;
  }|null>(null);

  const handleSelectedMunicipalityId: React.ComponentProps<typeof Combobox.Input>['onChange'] = e => {
    if (e?.target?.value) {
      setSelectedMunicipality(municipalities.find(m => m.municipalityId === e.target.value));
      setDocuments([]);
      setPaginationData(null);
    }
  };
  
  const handleLanguageChange = (langValue: string) => {
    router.push({ pathname, query }, asPath, { locale: langValue });
  };

  const openDetails = (item: Document) => {
    setSelectedDocument(item);
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
    translateLegalId(selectedMunicipality.municipalityId, legalId.replace('-', ''))
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
  
  const loadDocuments = (partyId: string, page: number) => {
    searchDocuments(selectedMunicipality.municipalityId, partyId, isIncludeConfidential, page, 1000, {'registrationNumber': 'desc'})
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
            duration: 3000,
            closeable: true
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
      isColumnSortable: true,
      property: 'registrationNumber',
      renderColumn: (value: string, item: Document) => {
        return (
          <span data-cy="table-column-registrationnbr">
            <span><Link href="#" onClick={() => openDetails(item)}>{item.registrationNumber}</Link></span>
          </span>
        );
      },    
    },
    {
      label: t(`search_documents:searchtable_headers.description`),
      isColumnSortable: true,
      property: 'description',
    },
    {
      label: t(`search_documents:searchtable_headers.confidentiality`),
      isColumnSortable: false,
      renderColumn: (value: string, item: Document) => {
        return (
          <span data-cy="table-column-confidentiality">
            <span className='confidential-img'>
              <LucideIcon color={item.confidentiality.confidential ? 'warning' : 'primary'} name={item.confidentiality.confidential ? 'lock' : 'unlock'} size= '2rem'/> 
            </span>
            {item.confidentiality.confidential ? t(`search_documents:confidential`) : t(`search_documents:public`)}
          </span>
        );
      },    
    },
    {
      label: t(`search_documents:searchtable_headers.created`),
      isColumnSortable: true,
      property: 'created',
      renderColumn: (value: string) => {
        return (
          <span data-cy="table-column-created">
            <span>{dayjs(value).format('YYYY-MM-DD HH:mm')}</span>
          </span>
        );
      },    
    },
    {
      label: t(`search_documents:searchtable_headers.created_by`),
      isColumnSortable: true,
      property: 'createdBy',
    }
  ];
  return (
    <DefaultLayout title={`${process.env.NEXT_PUBLIC_APP_NAME} - ${t('search_documents:title')}`}>

      <div className='customMenu'>
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

        <div className="language-bar">
          <Button.Group>
            <Button iconButton onClick={() => handleLanguageChange('sv')}>
              <Image
                alt="Svenska"
                htmlHeight="42"
                htmlWidth="26"
                src={process.env.NEXT_PUBLIC_BASEPATH + '/png/se.png'}
              />
            </Button>

            <Button iconButton onClick={() => handleLanguageChange('en')}>
              <Image
                alt="Engelska"
                htmlHeight="42"
                htmlWidth="26"
                src={process.env.NEXT_PUBLIC_BASEPATH + '/png/en.png'}
              />
            </Button>

            {user.name ?
              <Button>
                <NextLink href={`/logout`}>
                  <Link as="span" variant="link">
                    {capitalize(t('common:logout'))}
                  </Link>
                </NextLink>
              </Button>
            : ''}
          </Button.Group>
        </div>

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
                isLoading ? <Spinner /> : <LucideIcon name={'file-search'}  />
              }>
              {isLoading ? t('search_documents:ongoing_search') : t('search_documents:search')}
            </Button>

            {isInvalidInput &&
              <div>
                {t('search_documents:errors.invalidLegalId')}
              </div>
            }
          </p>
        </div>

        <div style={{ marginTop: '2em' }}>
        {isLoading ? <div className='middle'><Spinner color='info' /></div> :  documents.length > 0 &&
            <div>
              <AutoTable
                data-cy="documents-table"
                className="w-full"
                captionTitle={`${paginationData.totalElements} ${t('search_documents:matching_documents')} ${formatLegalId(legalId)}`}
                captionShowPages={true}
                tableSortable={true}
                autoheaders={labels}
                autodata={documents}
              />
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
