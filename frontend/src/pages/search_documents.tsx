import DefaultLayout from '@layouts/default-layout/default-layout.component';
import Main from '@layouts/main/main.component';
import { useUserStore } from '@services/user-service/user-service';
import NextLink from 'next/link';
import { useTranslation } from 'next-i18next';
import { shallow } from 'zustand/shallow';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { capitalize } from 'underscore.string';
import { Fragment, useState } from 'react';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { Link, Button, Dialog , Checkbox, cx, useSnackbar, Pagination, Input, Spinner, ZebraTable, ZebraTableColumn, ZebraTableHeader } from '@sk-web-gui/react';
import { translateLegalId, findDocuments } from '@services/document-service/search-document-service'
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import dayjs from 'dayjs';
import { ApiPartyData, ApiDocument } from '@interfaces/document';

export const SearchDocumentPage: React.FC = () => {
	const user = useUserStore((s) => s.user, shallow);
	const { t } = useTranslation();
	const [isInvalidInput, setIsInvalidInput] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const snackBar = useSnackbar();
	const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
	const [legalId, setLegalId] = useState(null);
	const [isIncludeConfidential, setIsIncludeConfidential] = useState(false);
	const [documents, setDocuments] = useState<ApiDocument[]>([]);
	const [paginationData, setPaginationData] = useState<{
		page: number;
		size: number;
		totalPages: number;
		totalElements: number;
	}>({});

	const openHandler = () => {
		setIsDetailOpen(true);
	};
	
	const closeHandler = () => {
		setIsDetailOpen(false);
	};

	const changeInput = (input: string) => {
		setIsInvalidInput(false);
		setDocuments([]);
		setPaginationData({});
		setLegalId(input);
	};

	const search = () => {
		if (legalId === null || 
		(legalId.replace('-', '').length != 12 && legalId.replace('-', '').length != 10)) {
			setIsInvalidInput(true);
			return;
		}

		setIsLoading(true);
		translateLegalId(legalId.replace('-', ''))
			.then((response: ApiPartyData) => {
				if (response.partyId === null) {
					snackBar({
						message: t(`search_documents:errors.legalIdNotTranslatable`),
						status: 'error',
						position: 'top'
					});
					setIsLoading(false);
					return;					
				}
				
				findDocuments(response.partyId, isIncludeConfidential, 0, 10, { registrationNumber: 'desc' })
					.then((res) => {
						setDocuments(res.documents);
						setPaginationData({
							page: res.page,
							size: res.size,
							totalPages: res.totalPages,
							totalElements: res.totalElements,
						});
		
						if (res.totalElements < 1) {
							snackBar({
								message: t(`search_documents:no_matching_documents`),
								status: 'info',
								position: 'top'
							});
						}
					})
					.then(() => setIsLoading(false))
					.catch((e) => {
						console.error('Error when loading matching documents:', e);
						setIsLoading(false);
					});
			});
	};

	const getPagedDocuments = (page: number) => {
		translateLegalId(legalId.replace('-', ''))
			.then((response: ApiPartyData) => {
				findDocuments(response.partyId, isIncludeConfidential, page, 10, { registrationNumber: 'desc' })
					.then((res) => {
						setDocuments(res.documents);
						setPaginationData({
							page: res.page,
							size: res.size,
							totalPages: res.totalPages,
							totalElements: res.totalElements,
						});
					})
					.catch((e) => {
						console.error('Error when loading matching documents:', e);
						setIsLoading(false);
					});
			});
	};

	const labels = [
		{
			label: t(`search_documents:searchtable_headers.municipality`),
			sortable: true,
			screenReaderOnly: false
		},
		{
			label: t(`search_documents:searchtable_headers.diarynumber`),
			sortable: true,
			screenReaderOnly: false
		},
		{
			label: t(`search_documents:searchtable_headers.revision`),
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

	const rows: ZebraTableColumn[][] = documents.map((r: ApiDocument, idx) => {
		return [
			{
				element: (
					<Fragment key={`mr${idx}`}>
						<span>{r.municipalityId}</span>
					</Fragment>
				),
				isShown: true
			},
			{
				element: (
					<Fragment key={`mr${idx}`}>
						<span><Link href="#" onClick={openHandler}>{r.registrationNumber}</Link></span>
					</Fragment>
				),
				isShown: true
			},
			{
				element: (
					<Fragment key={`mr${idx}`}>
						<span>{r.revision}</span>
					</Fragment>
				),
				isShown: true
			},
			{
				element: (
					<Fragment key={`mr${idx}`}>
						<span>
							{r.confidentiality.confidential ? t(`search_documents:confidential`) : t(`search_documents:public`)}
						</span>
					</Fragment>
				),
				isShown: true
			},
			{
				element: (
					<Fragment key={`mr${idx}`}>
						<span>{dayjs(r.created).format('YYYY-MM-DD HH:mm')}</span>
					</Fragment>
				),
				isShown: true
			},
			{
				element: (
					<Fragment key={`mr${idx}`}>
						<span>{r.createdBy}</span>
					</Fragment>
				),
				isShown: true
			},
			{
				element: (
					<div className="w-full flex justify-end">
						<Link
							key={`mr${idx}`}
							href={`/document/${r.id}/download`}
							target="_blank"
							className="no-underline w-full lg:w-44"
						>
							<div>
								<span className="relative leading-[2.8rem]">
									{t('search_documents:download_document')}
									<span>
										<OpenInNewIcon className="!w-[1.4rem] !h-[1.4rem] absolute -right-7 top-2" />
									</span>
								</span>
							</div>
						</Link>
					</div>
				),
				isShown: true
			}
		];
	});

	return (
		<DefaultLayout title={`${process.env.NEXT_PUBLIC_APP_NAME}` - t(`search_documents:title`)}>
			<Dialog show={isDetailOpen} onClose={closeHandler}>
				<Button onClick={closeHandler}>Stäng</Button>
			</Dialog>

			<div style={{ position: 'relative', top: '-6.2em' }}>
				<div style={{ float: 'right' }}>
					{user.name ?
						<NextLink href={`/logout`}>
							<Link as="span" variant="link">
								{capitalize(t('common:logout'))}
							</Link>
						</NextLink>
						: ''}
				</div>
			</div>
			<Main>
				<div className="text-content">
					<h1>
						{capitalize(`${t('common:welcome')} ${user.name ? user.name : ''}!`)}
					</h1>
					<p>{t('search_documents:description')}</p>

					<p>
						<Input
							placeholder='YYYYMMDD-NNNN'
							onChange={(e) => changeInput(e.target.value)}
							disabled={isLoading}
							className={isInvalidInput ? 'input-and-button border border-error' : 'input-and-button'}
							name=""
							data-cy="search-legalId"
						/>
						<Button
							type="button"
							className="input-and-button"
							onClick={() => search()}
							disabled={isLoading}
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
						<Checkbox
							className={isInvalidInput ? 'input-and-button border border-error' : 'input-and-button'}
							onChange={(e) => setIsIncludeConfidential(e.target.checked)}
						>
							{t('search_documents:include_confidential')}
						</Checkbox>
					</p>
				</div>

				<div style={{ marginTop: '2em' }}>
					{documents.length > 0 &&
						<div>
							<h4>
								{paginationData.totalElements} {t('search_documents:matching_documents')} {legalId} ({t('search_documents:displaying_page')} {paginationData.page + 1} {t('search_documents:of')} {paginationData.totalPages})
							</h4>

							<div className={cx(`w-full px-lg mt-sm border-b border-gray-stroke`)}></div>

							<ZebraTable
								aria-label="t('search_documents:document_table_title')"
								data-cy="main-table"
								activePage={paginationData?.page + 1 || 1}
								pageSize={paginationData?.totalElements || 20}
								headers={headers}
								rows={rows}
								tableSortable={false}
								defaultSort={{ idx: 1, sortMode: false }}
							/>

							{paginationData?.totalPages > 1 && (
								<div>
									<div className="w-full px-lg mt-sm border-t border-gray-stroke"></div>
									<Pagination
										pages={paginationData?.totalPages}
										activePage={paginationData?.page + 1}
										changePage={(p) => {
											getPagedDocuments(p - 1);
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
		...(await serverSideTranslations(locale, ['common', 'search_documents', 'layout'])),
	},
});

export default SearchDocumentPage;
