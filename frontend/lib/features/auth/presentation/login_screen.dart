import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../core/api/api_exception.dart';
import '../../../core/config/app_config.dart';
import '../../../core/providers/core_providers.dart';
import '../application/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _companyCodeController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isSubmitting = false;
  String? _errorMessage;

  // Branding resolved from the subdomain (via /tenant-info). When set, we're on a tenant portal
  // (e.g. vrindavan.enrix.in): show the company name/logo and hide the "Company code" field.
  bool _brandingLoading = true;
  String? _resolvedCompanyCode;
  String _brandName = 'Vrindavan';
  String? _logoUrl;

  @override
  void initState() {
    super.initState();
    _loadBranding();
  }

  Future<void> _loadBranding() async {
    try {
      final data = await ref.read(apiClientProvider).get('/tenant-info');
      final map = data as Map<String, dynamic>;
      final code = map['companyCode'] as String?;
      if (mounted) {
        setState(() {
          _resolvedCompanyCode = code;
          _brandName = (map['companyName'] as String?) ?? 'Vrindavan';
          _logoUrl = map['logoUrl'] as String?;
          if (code != null) _companyCodeController.text = code;
        });
      }
    } catch (_) {
      // Not a tenant subdomain (localhost / bare domain) — keep the company-code field.
    } finally {
      if (mounted) setState(() => _brandingLoading = false);
    }
  }

  @override
  void dispose() {
    _companyCodeController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });
    try {
      await ref.read(authProvider.notifier).login(
            companyCode: _companyCodeController.text.trim(),
            email: _emailController.text.trim(),
            password: _passwordController.text,
          );
    } catch (e) {
      setState(() => _errorMessage = e is ApiException ? e.message : 'Something went wrong. Please try again.');
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_brandingLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    final onTenantPortal = _resolvedCompanyCode != null;
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 400),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (_logoUrl != null && _logoUrl!.isNotEmpty) ...[
                    Image.network(
                      _logoUrl!.startsWith('http') ? _logoUrl! : '${AppConfig.mediaOrigin}${_logoUrl!}',
                      height: 52,
                      alignment: Alignment.centerLeft,
                      errorBuilder: (_, _, _) => const SizedBox.shrink(),
                    ),
                    const SizedBox(height: 12),
                  ],
                  Text(_brandName, style: Theme.of(context).textTheme.headlineMedium),
                  const SizedBox(height: 4),
                  Text('Sign in to your workspace', style: Theme.of(context).textTheme.bodyMedium),
                  const SizedBox(height: 32),
                  if (_errorMessage != null) ...[
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.errorContainer,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        _errorMessage!,
                        style: TextStyle(color: Theme.of(context).colorScheme.onErrorContainer),
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                  // Only ask for the company code when we couldn't resolve it from the domain.
                  if (!onTenantPortal) ...[
                    TextFormField(
                      controller: _companyCodeController,
                      decoration: const InputDecoration(labelText: 'Company code', hintText: 'acme'),
                      textInputAction: TextInputAction.next,
                      validator: (v) => (v == null || v.trim().isEmpty) ? 'Company code is required' : null,
                    ),
                    const SizedBox(height: 16),
                  ],
                  TextFormField(
                    controller: _emailController,
                    decoration: const InputDecoration(labelText: 'Email'),
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.next,
                    validator: (v) => (v == null || v.trim().isEmpty) ? 'Email is required' : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _passwordController,
                    decoration: const InputDecoration(labelText: 'Password'),
                    obscureText: true,
                    textInputAction: TextInputAction.done,
                    onFieldSubmitted: (_) => _submit(),
                    validator: (v) => (v == null || v.isEmpty) ? 'Password is required' : null,
                  ),
                  const SizedBox(height: 24),
                  FilledButton(
                    onPressed: _isSubmitting ? null : _submit,
                    child: _isSubmitting
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('Sign in'),
                  ),
                  const SizedBox(height: 16),
                  // Self-serve signup only makes sense off a specific company's portal.
                  if (!onTenantPortal)
                    TextButton(
                      onPressed: _isSubmitting ? null : () => context.push('/signup'),
                      child: const Text("Don't have a workspace? Create one"),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
