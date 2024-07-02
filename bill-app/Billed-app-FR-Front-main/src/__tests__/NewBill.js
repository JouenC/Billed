/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import mockStore from "../__mocks__/store"
import router from "../app/Router.js"
import {localStorageMock} from "../__mocks__/localStorage.js"
import userEvent from "@testing-library/user-event"

jest.mock("../app/store", () => mockStore)


describe("Given I am connected as an employee", () => {
  describe("When I am on the NewBill Page", () => {
    test("Then it should render the NewBill page correctly", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;

      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
      expect(screen.getByTestId("expense-type")).toBeTruthy();
      expect(screen.getByTestId("expense-name")).toBeTruthy();
      expect(screen.getByTestId("datepicker")).toBeTruthy();
      expect(screen.getByTestId("amount")).toBeTruthy();
      expect(screen.getByTestId("vat")).toBeTruthy();
      expect(screen.getByTestId("pct")).toBeTruthy();
      expect(screen.getByTestId("commentary")).toBeTruthy();
      expect(screen.getByTestId("file")).toBeTruthy();
    });
  });

  describe("When I submit a new Bill", () => {
    test("Then it should save the bill", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }));

      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBillInit = new NewBill({
        document, onNavigate, store: null, localStorage: window.localStorage
      });

      const formNewBill = screen.getByTestId("form-new-bill");
      expect(formNewBill).toBeTruthy();

      const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
      formNewBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(formNewBill);
      expect(handleSubmit).toHaveBeenCalled();
    });

    test("Then it should navigate to the new bill page", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
    });

    test("Then it should verify the uploaded file", async () => {
      jest.spyOn(mockStore, "bills");

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      Object.defineProperty(window, "location", { value: { hash: ROUTES_PATH['NewBill'] } });
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }));

      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBillInit = new NewBill({
        document, onNavigate, store: mockStore, localStorage: window.localStorage
      });

      const file = new File(['image'], 'image.png', { type: 'image/png' });
      const handleChangeFile = jest.fn((e) => newBillInit.handleChangeFile(e));
      const billFile = screen.getByTestId('file');

      billFile.addEventListener("change", handleChangeFile);
      userEvent.upload(billFile, file);

      expect(billFile.files[0].name).toBe('image.png');
      expect(handleChangeFile).toHaveBeenCalled();

      const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
      const formNewBill = screen.getByTestId("form-new-bill");
      formNewBill.addEventListener("submit", handleSubmit);
      fireEvent.submit(formNewBill);

      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});