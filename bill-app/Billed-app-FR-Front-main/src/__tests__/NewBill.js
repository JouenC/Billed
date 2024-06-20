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









  describe("When I submit a new Bill", () => {

    let newBill;
    let documentMock;
    let onNavigateMock;
    let storeMock;
    let localStorageMock;
    let formMock;
    let fileInputMock;

    beforeEach(() => {
      formMock = {
        addEventListener: jest.fn(),
        querySelector: jest.fn()
      };

      fileInputMock = {
        addEventListener: jest.fn(),
        files: [new File(['content'], 'test.png', { type: 'image/png' })]
      };

      documentMock = {
        querySelector: jest.fn((selector) => {
          if (selector === 'form[data-testid="form-new-bill"]') {
            return formMock;
          } else if (selector === 'input[data-testid="file"]') {
            return fileInputMock;
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

    test('handleChangeFile shows an alert for invalid file extension', () => {
      const eventMock = {
        preventDefault: jest.fn(),
        target: {
          value: 'C:\\fakepath\\test.txt'
        }
      };
  
      global.alert = jest.fn();
  
      newBill.handleChangeFile(eventMock);
  
      expect(global.alert).toHaveBeenCalledWith('Veuillez sélectionner un fichier avec une extension jpg, jpeg ou png.');
      expect(newBill.fileUrl).toBeNull();
      expect(newBill.fileName).toBeNull();
    });

    test("Then verify the file bill", async() => {
      jest.spyOn(mockStore, "bills")

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }      

      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      Object.defineProperty(window, "location", { value: { hash: ROUTES_PATH['NewBill']} })
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }))

      const html = NewBillUI()
      document.body.innerHTML = html

      const newBillInit = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      })

      const file = new File(['image'], 'image.png', {type: 'image/png'});
      const handleChangeFile = jest.fn((e) => newBillInit.handleChangeFile(e));
      const formNewBill = screen.getByTestId("form-new-bill")
      const billFile = screen.getByTestId('file');

      billFile.addEventListener("change", handleChangeFile);     
      userEvent.upload(billFile, file)
      
      expect(billFile.files[0].name).toBeDefined()
      expect(handleChangeFile).toBeCalled()
     
      const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
      formNewBill.addEventListener("submit", handleSubmit);     
      fireEvent.submit(formNewBill);
      expect(handleSubmit).toHaveBeenCalled();
    })
  })
})
