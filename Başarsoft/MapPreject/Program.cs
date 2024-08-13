using MapProject.Data;
using MapProject.UnitOfWork;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Add PostgreSQL connection
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<MapDbContext>(options =>options.UseNpgsql(connectionString,o => o.UseNetTopologySuite()));
// Add Swagger services
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "MapProject", Version = "v1" });

    // SchemaId ile ilgili özel bir isimlendirme fonksiyonu kullanabilirsiniz
    c.CustomSchemaIds(type => type.FullName);
});

builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

// CORS ekleyin
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder =>
        {
            builder.WithOrigins("https://localhost:7178") // Talep gönderen kaynak
                   .AllowAnyHeader()
                   .AllowAnyMethod();
        });
});

builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        // JSON serileþtirme ayarlarýný burada yapabilirsiniz.
        options.SerializerSettings.NullValueHandling = NullValueHandling.Ignore;
        options.SerializerSettings.FloatFormatHandling = FloatFormatHandling.String; // Float deðerleri string olarak formatlama
        options.SerializerSettings.Converters.Add(new StringEnumConverter()); // Enum deðerlerini string olarak dönüþtürür
    });


var app = builder.Build();


// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "My API v1");
    });
}
app.UseCors("AllowSpecificOrigin");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
