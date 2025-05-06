/**
 * Servicio para la integración con EnZona API de pagos
 */

interface EnzonaCredentials {
  consumerKey: string;
  consumerSecret: string;
  apiBaseUrl: string;
}

interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
  merchantOpId: string; // ID único para tu transacción
  customerId?: string;
  invoiceNumber?: string;
}

interface PaymentResponse {
  transactionUuid: string;
  redirectUrl: string;
  status: string;
}

/**
 * Códigos de error conocidos de EnZona y sus mensajes de usuario
 */
const ERROR_MESSAGES: Record<string, string> = {
  'invalid_token': 'La sesión ha expirado. Por favor, inicia el proceso de pago nuevamente.',
  'token_expired': 'La sesión ha expirado. Por favor, inicia el proceso de pago nuevamente.',
  'unauthorized': 'No tienes permiso para realizar esta operación. Verifica tus credenciales.',
  'not_found': 'No se encontró la transacción solicitada.',
  'invalid_request': 'La solicitud de pago es inválida. Verifica los datos ingresados.',
  'insufficient_funds': 'Fondos insuficientes para realizar la operación.',
  'invalid_amount': 'El monto del pago es inválido.',
  'duplicate_transaction': 'Ya existe una transacción con este identificador.',
  'service_unavailable': 'El servicio de EnZona no está disponible en este momento. Intenta más tarde.',
  'network_error': 'Error de conexión con EnZona. Verifica tu conexión a internet.',
  'default': 'Error al procesar el pago. Por favor, intenta nuevamente.'
};

/**
 * Clase principal para interactuar con EnZona API
 */
export class EnzonaService {
  private credentials: EnzonaCredentials;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;
  private tokenRetryCount: number = 0;
  private readonly MAX_TOKEN_RETRIES = 3;

  constructor(credentials: EnzonaCredentials) {
    this.credentials = credentials;
  }

  /**
   * Formatea un mensaje de error para el usuario final
   */
  private formatErrorMessage(error: any): string {
    if (!error) return ERROR_MESSAGES.default;

    // Si es un error de la API con código específico
    if (error.error_code) {
      return ERROR_MESSAGES[error.error_code] || error.error_description || ERROR_MESSAGES.default;
    }

    // Si es un error de red
    if (error.message && error.message.includes('fetch')) {
      return ERROR_MESSAGES.network_error;
    }

    // Error genérico
    return error.message || ERROR_MESSAGES.default;
  }

  /**
   * Registra errores para depuración
   */
  private logError(method: string, error: any, additionalInfo?: any): void {
    console.error(`[EnzonaService] Error en ${method}:`, {
      message: error.message || 'Error desconocido',
      status: error.status,
      responseData: error.responseData,
      additionalInfo,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Obtiene un token de acceso para llamadas a la API
   */
  private async getAccessToken(): Promise<string> {
    // Verificar si ya tenemos un token válido
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    try {
      // Obtener nuevo token
      const encodedCredentials = btoa(`${this.credentials.consumerKey}:${this.credentials.consumerSecret}`);
      
      const response = await fetch(`${this.credentials.apiBaseUrl}/token`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${encodedCredentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        // Extraer detalles del error
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: response.statusText };
        }

        // Registrar el error
        this.logError('getAccessToken', {
          status: response.status,
          responseData: errorData,
          message: 'Error obteniendo token de acceso'
        });

        throw new Error(`Error de autenticación con EnZona: ${this.formatErrorMessage(errorData)}`);
      }

      const data = await response.json();
      
      // Guardar token y su expiración
      this.accessToken = data.access_token;
      // Restar 5 minutos para asegurar que no usemos un token a punto de expirar
      this.tokenExpiry = new Date(Date.now() + (data.expires_in - 300) * 1000);
      this.tokenRetryCount = 0; // Resetear contador de reintentos
      
      // Asegurarnos de que siempre devolvemos un string
      if (!this.accessToken) {
        throw new Error('No se pudo obtener token de acceso');
      }
      
      return this.accessToken;
    } catch (error) {
      // Incrementar contador de reintentos
      this.tokenRetryCount++;
      
      // Si no hemos superado el máximo de reintentos, intentar otra vez
      if (this.tokenRetryCount < this.MAX_TOKEN_RETRIES) {
        console.warn(`Reintentando obtener token (intento ${this.tokenRetryCount} de ${this.MAX_TOKEN_RETRIES})`);
        return this.getAccessToken();
      }
      
      // Si hemos llegado aquí, todos los reintentos han fallado
      throw error;
    }
  }

  /**
   * Procesar respuesta de error HTTP
   */
  private async handleErrorResponse(response: Response, operation: string): Promise<never> {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { error: response.statusText };
    }

    this.logError(operation, {
      status: response.status,
      responseData: errorData,
      message: `Error en ${operation}`
    });

    throw new Error(`Error de EnZona en ${operation}: ${this.formatErrorMessage(errorData)}`);
  }

  /**
   * Crear una solicitud de pago
   */
  async createPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(`${this.credentials.apiBaseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: {
            total: paymentData.amount.toString(),
            currency: paymentData.currency
          },
          description: paymentData.description,
          return_url: paymentData.returnUrl,
          cancel_url: paymentData.cancelUrl,
          merchant_op_id: paymentData.merchantOpId,
          customer_id: paymentData.customerId,
          invoice_number: paymentData.invoiceNumber
        })
      });

      if (!response.ok) {
        return this.handleErrorResponse(response, 'createPayment');
      }

      const data = await response.json();
      
      // Verificar que la respuesta contenga los datos esperados
      if (!data.transaction_uuid || !data.links || !data.links.find((link: any) => link.rel === 'confirm')) {
        throw new Error('Respuesta incompleta de EnZona: Falta información para continuar el pago');
      }
      
      return {
        transactionUuid: data.transaction_uuid,
        redirectUrl: data.links.find((link: any) => link.rel === 'confirm').href,
        status: data.status
      };
    } catch (error) {
      // Si es un error de token inválido, intentar renovarlo y reintentar una vez
      if (error instanceof Error && error.message.includes('token')) {
        this.accessToken = null; // Forzar renovación de token
        try {
          return await this.createPayment(paymentData);
        } catch (retryError) {
          this.logError('createPayment (retry)', retryError, { paymentData });
          throw retryError;
        }
      }
      
      // Otros errores
      this.logError('createPayment', error, { paymentData });
      throw error;
    }
  }

  /**
   * Verificar estado de un pago
   */
  async checkPaymentStatus(transactionUuid: string): Promise<any> {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(`${this.credentials.apiBaseUrl}/payments/${transactionUuid}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        return this.handleErrorResponse(response, 'checkPaymentStatus');
      }

      return response.json();
    } catch (error) {
      this.logError('checkPaymentStatus', error, { transactionUuid });
      throw error;
    }
  }

  /**
   * Completar transacción (para flujos en dos pasos)
   */
  async completePayment(transactionUuid: string): Promise<any> {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(`${this.credentials.apiBaseUrl}/payments/${transactionUuid}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return this.handleErrorResponse(response, 'completePayment');
      }

      return response.json();
    } catch (error) {
      this.logError('completePayment', error, { transactionUuid });
      throw error;
    }
  }

  /**
   * Cancelar una transacción
   */
  async cancelPayment(transactionUuid: string): Promise<any> {
    try {
      const token = await this.getAccessToken();
      
      const response = await fetch(`${this.credentials.apiBaseUrl}/payments/${transactionUuid}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return this.handleErrorResponse(response, 'cancelPayment');
      }

      return response.json();
    } catch (error) {
      this.logError('cancelPayment', error, { transactionUuid });
      throw error;
    }
  }
}

// Exportar una instancia configurada con claves de entorno
export const enzonaService = new EnzonaService({
  consumerKey: import.meta.env.PUBLIC_ENZONA_CONSUMER_KEY || '',
  consumerSecret: import.meta.env.ENZONA_CONSUMER_SECRET || '',
  apiBaseUrl: import.meta.env.PUBLIC_ENZONA_API_URL || 'https://api.enzona.net/payment/v1.0.0'
}); 