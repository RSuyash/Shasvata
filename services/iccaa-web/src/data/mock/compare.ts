import { MOCK_COMPANY_DETAILS } from './companyDetails';
import { CompanyDetail } from '../../types/iccaa';

export const MOCK_COMPARE = {
  getCompareData: (idA: string, idB: string): [CompanyDetail, CompanyDetail] => {
    const a = MOCK_COMPANY_DETAILS.find(c => c.id === idA) || MOCK_COMPANY_DETAILS[0];
    const b = MOCK_COMPANY_DETAILS.find(c => c.id === idB) || MOCK_COMPANY_DETAILS[1];
    return [a, b];
  }
};
