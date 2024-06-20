/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import mockStore from "../__mocks__/store"

jest.mock("../app/store", () => mockStore)


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {

    test("Then it should render the NewBill page correctly", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      expect(screen.getByTestId("form-new-bill")).toBeTruthy()
      expect(screen.getByTestId("expense-type")).toBeTruthy()
      expect(screen.getByTestId("expense-name")).toBeTruthy()
      expect(screen.getByTestId("datepicker")).toBeTruthy()
      expect(screen.getByTestId("amount")).toBeTruthy()
      expect(screen.getByTestId("vat")).toBeTruthy()
      expect(screen.getByTestId("pct")).toBeTruthy()
      expect(screen.getByTestId("commentary")).toBeTruthy()
      expect(screen.getByTestId("file")).toBeTruthy()
    })
  })






describe('NewBill class', () => {
  let newBill;
  let documentMock;
  let onNavigateMock;
  let storeMock;
  let localStorageMock;

  beforeEach(() => {
    documentMock = {
      querySelector: jest.fn((selector) => {
        if (selector === 'form[data-testid="form-new-bill"]') {
          return {
            addEventListener: jest.fn()
          };
        } else if (selector === 'input[data-testid="file"]') {
          return {
            addEventListener: jest.fn(),
            files: [new File(['content'], 'test.png', { type: 'image/png' })]
          };
        }
        return null;
      })
    };

    onNavigateMock = jest.fn();

    storeMock = {
      bills: jest.fn(() => ({
        create: jest.fn(() => Promise.resolve({ fileUrl: 'url', key: 'key' }))
      }))
    };

    localStorageMock = {
      getItem: jest.fn(() => JSON.stringify({ email: 'test@test.com' }))
    };

    global.localStorage = localStorageMock;

    newBill = new NewBill({ document: documentMock, onNavigate: onNavigateMock, store: storeMock, localStorage: localStorageMock });
  });

  test('handleChangeFile uploads a file and sets fileUrl and fileName', async () => {
    const eventMock = {
      preventDefault: jest.fn(),
      target: {
        value: 'C:\\fakepath\\test.png'
      }
    };

    await newBill.handleChangeFile(eventMock);

    expect(storeMock.bills).toHaveBeenCalled();
    expect(storeMock.bills().create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.any(FormData),
      headers: { noContentType: true }
    }));
    expect(newBill.fileUrl).toBe('url');
    expect(newBill.fileName).toBe('test.png');
  });

  test('handleChangeFile alerts on invalid file extension', () => {
    global.alert = jest.fn();

    const eventMock = {
      preventDefault: jest.fn(),
      target: {
        value: 'C:\\fakepath\\test.txt'
      }
    };

    newBill.handleChangeFile(eventMock);

    expect(global.alert).toHaveBeenCalledWith('Veuillez sélectionner un fichier avec une extension jpg, jpeg ou png.');
    expect(storeMock.bills).not.toHaveBeenCalled();
  });

  test('handleSubmit sends correct data and navigates', () => {
    expect(mockStore).toBe(mockedBills)
    // newBill.fileUrl = 'url';
    // newBill.fileName = 'test.png';

    // const eventMock = {
    //   preventDefault: jest.fn(),
    //   target: {
    //     querySelector: jest.fn((selector) => {
    //       const selectors = {
    //         'input[data-testid="datepicker"]': { value: '2021-01-01' },
    //         'select[data-testid="expense-type"]': { value: 'Transports' },
    //         'input[data-testid="expense-name"]': { value: 'Train' },
    //         'input[data-testid="amount"]': { value: '100' },
    //         'input[data-testid="vat"]': { value: '20' },
    //         'input[data-testid="pct"]': { value: '10' },
    //         'textarea[data-testid="commentary"]': { value: 'Business trip' }
    //       };
    //       return selectors[selector];
    //     })
    //   }
    // };

    // newBill.updateBill = jest.fn();

    // newBill.handleSubmit(eventMock);

    // expect(newBill.updateBill).toHaveBeenCalledWith(expect.objectContaining({
    //   email: 'test@test.com',
    //   type: 'Transports',
    //   name: 'Train',
    //   amount: 100,
    //   date: '2021-01-01',
    //   vat: '20',
    //   pct: 10,
    //   commentary: 'Business trip',
    //   fileUrl: 'url',
    //   fileName: 'test.png',
    //   status: 'pending'
    // }));
    expect(onNavigateMock).toHaveBeenCalledWith(ROUTES_PATH['Bills']);
  });
});

})
