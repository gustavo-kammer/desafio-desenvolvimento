using System.Text.Json;
using System.Text.Json.Serialization;
using Estoque.API.Errors;
using Estoque.API.OpenApi;
using Estoque.API.Security;
using Estoque.Application;
using Estoque.Infra.Data;
using Estoque.Infra.Ioc;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

static JsonStringEnumConverter EnumConverter() =>
    new(JsonNamingPolicy.CamelCase, allowIntegerValues: false);

builder.Services
    .AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(EnumConverter()))
    .ConfigureApiBehaviorOptions(options =>
        options.InvalidModelStateResponseFactory = context =>
        {
            var problem = new ValidationProblemDetails(context.ModelState)
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Requisição inválida.",
                Instance = context.HttpContext.Request.Path.Value
            };
            problem.Extensions["errorCode"] = ApiErrorCodes.InvalidRequest;
            problem.Extensions["traceId"] = context.HttpContext.TraceIdentifier;

            return new BadRequestObjectResult(problem) { ContentTypes = { "application/problem+json" } };
        });

builder.Services.ConfigureHttpJsonOptions(options => options.SerializerOptions.Converters.Add(EnumConverter()));

builder.Services.AddOpenApi(options => options.AddDocumentTransformer<ApiDocumentTransformer>());
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApiSecurity(builder.Configuration);

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

var app = builder.Build();

await app.Services.InitializeDatabaseAsync();

app.UseExceptionHandler();

app.MapOpenApi().AllowAnonymous();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/openapi/v1.json", "Estoque API v1");
    options.RoutePrefix = "swagger";
    options.DocumentTitle = "Estoque API";
    options.EnablePersistAuthorization();
    options.DisplayRequestDuration();
});

app.MapGet("/", () => Results.Redirect("/swagger")).AllowAnonymous().ExcludeFromDescription();

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();