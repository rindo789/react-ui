import React, { Component } from 'react';
import axios, { AxiosError, AxiosResponse } from "axios";

interface ApiResponse<T> {
  data: T;
}

interface ApiError {
  message: string;
}

class Request {

  getProjectUrl(): string {
    if (!globalThis.hubleto.config.projectUrl) {
      console.warn('HubletoReactUi.Request: projectUrl is not set. Your AJAX requests might not work. To suppress this warning, set projectUrl to empty value.')
      console.warn('To set the value add a script tag in HTML head section and set window.configEnv.projectUrl.')
      console.warn('To suppress this warning, set may set projectUrl to an empty value.')
    };

    return globalThis.hubleto.config.projectUrl + '/';
  }

  alertOnError(responseData: any) {
    globalThis.hubleto.showDialogWarning(responseData.message);
  }

  public get<T>(
    url: string,
    queryParams: Record<string, any>,
    successCallback?: (data: ApiResponse<T>) => void,
    errorCallback?: (data: any) => void,
  ): void {
    document.body.classList.add("ajax-loading");
    axios.get<T, AxiosResponse<ApiResponse<T>>>(this.getProjectUrl() + url, {
      params: queryParams
    }).then(res => {
      const responseData: any = res.data;
      document.body.classList.remove("ajax-loading");
      if (responseData.status == 'error') {
        this.alertOnError(responseData);
        if (errorCallback) errorCallback(responseData);
      } else if (successCallback) successCallback(responseData);
    }).catch((err: AxiosError<ApiError>) => this.catchHandler(url, err, errorCallback));
  }

  public post<T>(
    url: string,
    postData: Record<string, any>,
    queryParams?: Record<string, string>|{},
    successCallback?: (data: ApiResponse<T>) => void,
    errorCallback?: (data: any) => void,
  ): void {
    document.body.classList.add("ajax-loading");
    axios.post<T, AxiosResponse<ApiResponse<T>>>(this.getProjectUrl() + url, postData, {
      params: queryParams
    }).then(res => {
      const responseData: any = res.data;
      document.body.classList.remove("ajax-loading");
      if (responseData.status == 'error') {
        this.alertOnError(responseData);
        if (errorCallback) errorCallback(responseData);
      } else if (successCallback) successCallback(responseData);
    }).catch((err: AxiosError<ApiError>) => this.catchHandler(url, err, errorCallback));
  }

  public put<T>(
    url: string,
    putData: Record<string, any>,
    queryParams?: Record<string, string>|{},
    successCallback?: (data: ApiResponse<T>) => void,
    errorCallback?: (data: any) => void,
  ): void {
    axios.put<T, AxiosResponse<ApiResponse<T>>>(this.getProjectUrl() + url, putData, {
      params: queryParams
    }).then(res => {
      const responseData: any = res.data;
      if (responseData.status == 'error') {
        this.alertOnError(responseData);
        if (errorCallback) errorCallback(responseData);
      } else if (successCallback) successCallback(responseData);
    }).catch((err: AxiosError<ApiError>) => this.catchHandler(url, err, errorCallback));
  }

  public patch<T>(
    url: string,
    patchData: Record<string, any>,
    queryParams?: Record<string, string>|{},
    successCallback?: (data: ApiResponse<T>) => void,
    errorCallback?: (data: any) => void,
  ): void {
    axios.patch<T, AxiosResponse<ApiResponse<T>>>(this.getProjectUrl() + url, patchData, {
      params: queryParams
    }).then(res => {
      const responseData: any = res.data;
      if (responseData.status == 'error') {
        this.alertOnError(responseData);
        if (errorCallback) errorCallback(responseData);
      } else if (successCallback) successCallback(responseData);
    }).catch((err: AxiosError<ApiError>) => this.catchHandler(url, err, errorCallback));
  }

  public delete<T>(
    url: string,
    queryParams: Record<string, any>,
    successCallback?: (data: ApiResponse<T>) => void,
    errorCallback?: (data: any) => void,
  ): void {
    axios.delete<T, AxiosResponse<ApiResponse<T>>>(this.getProjectUrl() + url, {
      params: queryParams
    }).then(res => {
      const responseData: any = res.data;
      if (responseData.status == 'error') {
        this.alertOnError(responseData);
        if (errorCallback) errorCallback(responseData);
      } else if (successCallback) successCallback(responseData);
    }).catch((err: AxiosError<ApiError>) => this.catchHandler(url, err, errorCallback));
  }

  private catchHandler(
    url: string,
    err: AxiosError<ApiError>,
    errorCallback?: (data: any) => void
  ) {
    console.log(err);
    if (err.response) {
      this.fatalErrorNotification(url, err.response.data);
      if (errorCallback) errorCallback(err.response);
    } else {
      console.error('HubletoReactUi: Request @ ' + url + ' unknown error.');
      console.error(err);
    }
  }

  private fatalErrorNotification(url: string, error: any) {
    console.error('HubletoReactUi request @ ' + url + ' finished with error: ', error);

    if (typeof error == 'string') {
      globalThis.hubleto.showDialogDanger(error);
    } else {
      switch(error.code) {
        case 87335:
          // globalThis.hubleto.showDialogWarning(globalThis.hubleto.getValidationErrorMessage(error.message));
          break;
        case 23000:
          globalThis.hubleto.showDialogDanger(globalThis.hubleto.getDuplicateEntryErrorMessage(error.message));
          break;
        default:
          let content = globalThis.hubleto.getGenericErrorMessage(
            error.message,
            error.code,
            url
          );
          globalThis.hubleto.showDialogDanger(content);
        break;

      }
    }
  }

}

const request = new Request();
export default request;
