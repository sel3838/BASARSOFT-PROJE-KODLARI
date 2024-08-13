namespace MapProject.Models
{
    public class BaseResponseModel<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public T Data { get; set; }

        public BaseResponseModel() { }
        public BaseResponseModel(bool success, string message)
        {
            Success = success;
            Message = message;
        }
        public BaseResponseModel(bool success, string message, T data)
        {
            Success = success;
            Message = message;
            Data = data;
        }

    }
}
