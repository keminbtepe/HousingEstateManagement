namespace HousingEstateManagement.Domain.Common
{
    /// <summary>
    /// Tüm API cevapları için standart dönüş formatı.
    /// </summary>
    /// <typeparam name="T">Dönen verinin tipi.</typeparam>
    public class Result<T>
    {
        public bool IsSuccess { get; set; }
        public T? Data { get; set; }
        public string Message { get; set; } = string.Empty;

        public static Result<T> Success(T data, string message = "İşlem başarılı.")
        {
            return new Result<T> { IsSuccess = true, Data = data, Message = message };
        }

        public static Result<T> Failure(string message)
        {
            return new Result<T> { IsSuccess = false, Data = default, Message = message };
        }
    }

    /// <summary>
    /// Veri içermeyen standart dönüş formatı.
    /// </summary>
    public class Result
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; } = string.Empty;

        public static Result Success(string message = "İşlem başarılı.")
        {
            return new Result { IsSuccess = true, Message = message };
        }

        public static Result Failure(string message)
        {
            return new Result { IsSuccess = false, Message = message };
        }
    }
}
