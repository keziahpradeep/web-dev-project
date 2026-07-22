namespace WebApplication8.Models
{
    public class Product
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public string Description { get; set; }
        public decimal PricePerQuantity { get; set; }
        public int Quantity { get; set; }
        public decimal Total => PricePerQuantity * Quantity;
    }
}
